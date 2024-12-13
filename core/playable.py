from abc import ABC, abstractmethod

import numpy as np


class Playable(ABC):
    @abstractmethod
    def compute_wave(self, duration: float) -> np.ndarray:
        pass

    