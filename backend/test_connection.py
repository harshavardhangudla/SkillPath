from database import verify_connection, close_driver


if __name__ == "__main__":
    try:
        verify_connection()
    finally:
        close_driver()