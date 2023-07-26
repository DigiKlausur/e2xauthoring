from dataclasses import dataclass


@dataclass
class SuccessMessage:
    success: bool = True
    message: str = ""


@dataclass
class ErrorMessage:
    success: bool = False
    error: str = ""
