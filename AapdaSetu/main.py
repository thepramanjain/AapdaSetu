import logging


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    logging.getLogger(__name__).info("Hello from p-4!")


if __name__ == "__main__":
    main()
