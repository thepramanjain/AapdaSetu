// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AapdaSetu {
    address public owner;

    enum DisasterStatus {
        PENDING,
        APPROVED,
        REJECTED,
        RELEASED
    }

    struct DisasterRecommendation {
        string disasterId;
        string location;
        uint8 severity;
        uint8 confidenceScore;
        uint256 recommendedAmount;
        DisasterStatus status;
        string aiDecisionHash;
        string metadataURI;
        address submittedBy;
        address approvedBy;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct HistoryEntry {
        DisasterStatus status;
        string note;
        address actor;
        uint256 timestamp;
    }

    mapping(string => DisasterRecommendation) private disasters;
    mapping(string => HistoryEntry[]) private disasterHistory;
    mapping(address => bool) public governmentApprovers;
    string[] private disasterIds;

    event ApproverAdded(address indexed approver);
    event ApproverRemoved(address indexed approver);
    event DisasterStored(
        string indexed disasterId,
        string location,
        uint8 severity,
        uint8 confidenceScore,
        uint256 recommendedAmount,
        string aiDecisionHash,
        string metadataURI,
        address indexed submittedBy,
        uint256 timestamp
    );
    event RecommendationApproved(string indexed disasterId, address indexed approver, string note, uint256 timestamp);
    event RecommendationRejected(string indexed disasterId, address indexed approver, string reason, uint256 timestamp);
    event FundsMarkedReleased(string indexed disasterId, address indexed actor, string note, uint256 timestamp);
    event StatusUpdated(string indexed disasterId, DisasterStatus status, string note, address indexed actor, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyApprover() {
        require(governmentApprovers[msg.sender], "Only government approver can call this function");
        _;
    }

    modifier disasterExists(string memory disasterId) {
        require(bytes(disasters[disasterId].disasterId).length != 0, "Disaster not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        governmentApprovers[msg.sender] = true;
        emit ApproverAdded(msg.sender);
    }

    function addApprover(address approver) external onlyOwner {
        require(approver != address(0), "Invalid approver address");
        require(!governmentApprovers[approver], "Approver already exists");

        governmentApprovers[approver] = true;
        emit ApproverAdded(approver);
    }

    function removeApprover(address approver) external onlyOwner {
        require(approver != owner, "Owner approver cannot be removed");
        require(governmentApprovers[approver], "Approver not found");

        governmentApprovers[approver] = false;
        emit ApproverRemoved(approver);
    }

    function storeDisaster(
        string memory disasterId,
        string memory location,
        uint8 severity,
        uint8 confidenceScore,
        uint256 recommendedAmount,
        string memory aiDecisionHash,
        string memory metadataURI
    ) external onlyOwner {
        require(bytes(disasterId).length != 0, "Disaster ID is required");
        require(bytes(location).length != 0, "Location is required");
        require(bytes(aiDecisionHash).length != 0, "AI decision hash is required");
        require(bytes(disasters[disasterId].disasterId).length == 0, "Disaster ID already exists");
        require(severity >= 1 && severity <= 5, "Severity must be between 1 and 5");
        require(confidenceScore <= 100, "Confidence score must be between 0 and 100");

        disasters[disasterId] = DisasterRecommendation({
            disasterId: disasterId,
            location: location,
            severity: severity,
            confidenceScore: confidenceScore,
            recommendedAmount: recommendedAmount,
            status: DisasterStatus.PENDING,
            aiDecisionHash: aiDecisionHash,
            metadataURI: metadataURI,
            submittedBy: msg.sender,
            approvedBy: address(0),
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        disasterIds.push(disasterId);
        _appendHistory(disasterId, DisasterStatus.PENDING, "AI recommendation stored");

        emit DisasterStored(
            disasterId,
            location,
            severity,
            confidenceScore,
            recommendedAmount,
            aiDecisionHash,
            metadataURI,
            msg.sender,
            block.timestamp
        );
    }

    function approveRecommendation(string memory disasterId, string memory note)
        external
        onlyApprover
        disasterExists(disasterId)
    {
        DisasterRecommendation storage disaster = disasters[disasterId];
        require(disaster.status == DisasterStatus.PENDING, "Disaster is not pending");

        disaster.status = DisasterStatus.APPROVED;
        disaster.approvedBy = msg.sender;
        disaster.updatedAt = block.timestamp;
        _appendHistory(disasterId, DisasterStatus.APPROVED, note);

        emit RecommendationApproved(disasterId, msg.sender, note, block.timestamp);
        emit StatusUpdated(disasterId, DisasterStatus.APPROVED, note, msg.sender, block.timestamp);
    }

    function rejectRecommendation(string memory disasterId, string memory reason)
        external
        onlyApprover
        disasterExists(disasterId)
    {
        require(bytes(reason).length != 0, "Rejection reason is required");

        DisasterRecommendation storage disaster = disasters[disasterId];
        require(disaster.status == DisasterStatus.PENDING, "Disaster is not pending");

        disaster.status = DisasterStatus.REJECTED;
        disaster.approvedBy = msg.sender;
        disaster.updatedAt = block.timestamp;
        _appendHistory(disasterId, DisasterStatus.REJECTED, reason);

        emit RecommendationRejected(disasterId, msg.sender, reason, block.timestamp);
        emit StatusUpdated(disasterId, DisasterStatus.REJECTED, reason, msg.sender, block.timestamp);
    }

    function releaseFunds(string memory disasterId, string memory note)
        external
        onlyApprover
        disasterExists(disasterId)
    {
        DisasterRecommendation storage disaster = disasters[disasterId];
        require(disaster.status == DisasterStatus.APPROVED, "Disaster is not approved");

        disaster.status = DisasterStatus.RELEASED;
        disaster.updatedAt = block.timestamp;
        _appendHistory(disasterId, DisasterStatus.RELEASED, note);

        emit FundsMarkedReleased(disasterId, msg.sender, note, block.timestamp);
        emit StatusUpdated(disasterId, DisasterStatus.RELEASED, note, msg.sender, block.timestamp);
    }

    function updateStatus(string memory disasterId, DisasterStatus status, string memory note)
        external
        onlyApprover
        disasterExists(disasterId)
    {
        DisasterRecommendation storage disaster = disasters[disasterId];
        require(status != disaster.status, "Status is already set");
        require(disaster.status != DisasterStatus.RELEASED, "Released disaster is final");
        require(status != DisasterStatus.PENDING, "Cannot return to pending");
        require(
            status == DisasterStatus.REJECTED || status == DisasterStatus.APPROVED,
            "Use releaseFunds for release status"
        );

        disaster.status = status;
        disaster.updatedAt = block.timestamp;

        if (status == DisasterStatus.APPROVED || status == DisasterStatus.REJECTED) {
            disaster.approvedBy = msg.sender;
        }

        _appendHistory(disasterId, status, note);
        emit StatusUpdated(disasterId, status, note, msg.sender, block.timestamp);
    }

    function getDisaster(string memory disasterId)
        external
        view
        disasterExists(disasterId)
        returns (DisasterRecommendation memory)
    {
        return disasters[disasterId];
    }

    function getHistory(string memory disasterId)
        external
        view
        disasterExists(disasterId)
        returns (HistoryEntry[] memory)
    {
        return disasterHistory[disasterId];
    }

    function getAllDisasterIds() external view returns (string[] memory) {
        return disasterIds;
    }

    function getDisasterCount() external view returns (uint256) {
        return disasterIds.length;
    }

    function _appendHistory(string memory disasterId, DisasterStatus status, string memory note) private {
        disasterHistory[disasterId].push(
            HistoryEntry({
                status: status,
                note: note,
                actor: msg.sender,
                timestamp: block.timestamp
            })
        );
    }
}
