import argparse
import json
from typing import Any, List, Optional, Tuple, TypedDict

import pdfplumber

BoundingBox = Tuple[float, float, float, float]


class Table(TypedDict):
    bbox: BoundingBox
    data: List[List[str]]


class TextData(TypedDict):
    bbox: BoundingBox
    text: str


class PageData(TypedDict):
    pageNumber: int
    text: str
    textLayout: str
    tables: List[Table]


class DocumentStructure(TypedDict):
    pages: List[PageData]


def get_auto_layout(
    pdfPath: str,
    startPage: Optional[int] = None,
    endPage: Optional[int] = None,
    xTolerance: Optional[int] = None,
    yTolerance: Optional[int] = None,
    yDensity: Optional[int] = None,
) -> DocumentStructure:
    """
    Extract text and bounding box information from a given PDF.

    Args:
    - pdfPath (str): Path to the PDF file.
    - startPage (Optional[int], optional): Page to start extracting from. Defaults to 1.
    - endPage (Optional[int], optional): Page to end extracting at. If None, extract till the end. Defaults to None.
    - xTolerance (Optional[int], optional): Tolerance for x-coordinate. Defaults to 3.
    - yTolerance (Optional[int], optional): Tolerance for y-coordinate. Defaults to 3.
    - yDensity (Optional[int], optional): Density for y-coordinate. Defaults to 10.

    Returns:
    - DocumentStructure: Structured data organized by pages.
    """
    # Set defaults if parameters are None
    startPage = startPage or 1
    xTolerance = xTolerance or 3
    yTolerance = yTolerance or 3
    yDensity = yDensity or 10

    pdf = pdfplumber.open(pdfPath)

    output = {"pages": []}

    # Ensure startPage is within the valid range
    startPage = max(1, min(startPage, len(pdf.pages)))

    # If endPage is None, set it to the last page
    if endPage is None:
        endPage = len(pdf.pages)
    else:
        endPage = max(1, min(endPage, len(pdf.pages)))

    # Adjust the pages to process based on the start and end pages
    pages_to_process = pdf.pages[startPage - 1 : endPage]  # -1 because pages are 0-indexed

    # Enumerate through each page
    for pageNumber, page in enumerate(pages_to_process, start=startPage):
        # Extract text from the page
        pageText = page.extract_text(x_tolerance=xTolerance, y_tolerance=yTolerance, y_density=yDensity)
        pageTextLayout = page.extract_text(layout=True, x_tolerance=xTolerance, y_tolerance=yTolerance, y_density=yDensity)

        # Remove trailing whitespace from each line in pageTextLayout
        if pageTextLayout:
            pageTextLayout = "\n".join(line.rstrip() for line in pageTextLayout.split("\n"))

        # Extract tables from the page
        tables = page.extract_tables()
        # For bbox (bounding box), we'll assume you want the bbox of tables
        tables_with_bboxes = [{"table": table, "bbox": page.find_tables()[i].bbox} for i, table in enumerate(tables)]

        # Append the extracted data to our data structure
        output["pages"].append(
            {
                "pageNumber": pageNumber,
                "text": pageText,
                "textLayout": pageTextLayout,
                "tables": tables_with_bboxes,
            }
        )

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract text and bounding box information from a PDF.",
    )
    parser.add_argument("pdfPath", type=str, help="Path to the PDF file")
    parser.add_argument("--startPage", type=int, help="Page to start extracting from")
    parser.add_argument("--endPage", type=int, help="Page to end extracting at")
    parser.add_argument("--xTolerance", type=int, help="Tolerance for x-coordinate")
    parser.add_argument("--yTolerance", type=int, help="Tolerance for y-coordinate")
    parser.add_argument("--yDensity", type=int, help="Density for y-coordinate")

    options = parser.parse_args()

    document_structure = get_auto_layout(**vars(options))

    print(json.dumps(document_structure, indent=4))
