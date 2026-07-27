$ErrorActionPreference = "Stop"

Write-Host "Committing deletions..."
git add -u
git commit -m "Remove old P-4 directory"
git push origin main

Write-Host "Committing root files..."
$files = Get-ChildItem -Path AapdaSetu -File
foreach ($file in $files) {
    git add "AapdaSetu/$($file.Name)"
}
git commit -m "Add root files in AapdaSetu"
git push origin main

Write-Host "Committing folders one by one..."
$folders = Get-ChildItem -Path AapdaSetu -Directory
foreach ($folder in $folders) {
    $folderName = $folder.Name
    Write-Host "Committing folder $folderName..."
    git add "AapdaSetu/$folderName"
    git commit -m "Add AapdaSetu/$folderName directory"
    git push origin main
}

Write-Host "Done!"
