"""
Centralized error handling
In order to possible change the error handeling in the future
"""


class Error:
    """Centralized error handeling"""

    @staticmethod
    def value(msg: str) -> None:
        """Raise ValueError"""
        error_msg = f"ValueError: {msg}"
        raise ValueError(error_msg)

    @staticmethod
    def type(expected: str, actual: str) -> None:
        """Raise TypeError"""
        raise TypeError(f"Expected {expected}, got {actual}")

    @staticmethod
    def file_not_found(path: str) -> None:
        """Raise FileNotFound"""
        error_msg = f"Could not find file: {path}"
        raise TypeError(error_msg)
