"""
Package configuration for the `polynomial` library.
"""
from pathlib import Path
from setuptools import find_packages, setup

README_PATH = Path(__file__).parent / "README.md"
LONG_DESCRIPTION = README_PATH.read_text(encoding="utf-8") if README_PATH.exists() else ""

setup(
    name="polynomial",
    version="0.2.0",
    author="Kartikesh Mishra",
    author_email="mk314k@mit.edu",
    description="Univariate polynomial algebra, iterative root-finding (Newton, Secant, Bisection), and the Polynomial Factorization Procedure (PFP).",
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    url="https://github.com/mk314k/Polynomial",
    packages=find_packages(include=["polynomial", "polynomial.*"]),
    python_requires=">=3.8",
    install_requires=[],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Topic :: Scientific/Engineering :: Mathematics",
    ],
)
