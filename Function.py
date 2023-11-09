from typing import Callable, Set, TypeVar

T = TypeVar('T')
U = TypeVar('U')

class Function:
    def __init__(self, domain: Set[T], range_set: Set[U], mapping: Callable[[T], U]):
        self.domain = domain
        self.range_set = range_set
        self.mapping = mapping

    def __call__(self, x: T) -> U:
        if x in self.domain:
            return self.mapping(x)
        raise ValueError(f"{x} is not in the domain {self.domain}")
