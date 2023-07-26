from dataclasses import dataclass
from typing import Dict


@dataclass
class Template:
    name: str


@dataclass
class TaskPool:
    name: str
    n_tasks: int


@dataclass
class Task:
    name: str
    pool: str
    points: int
    n_questions: int
    git_status: Dict


@dataclass
class Exercise:
    name: str
    assignment: str
