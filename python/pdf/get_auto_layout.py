import argparse
import json
from typing import Any, List, Tuple, TypedDict

import pdfplumber

BoundingBox = Tuple[float, float, float, float]


class Table(TypedDict):
    bbox: BoundingBox
    data: List[List[str]]


class TextData(TypedDict):
    bbox: BoundingBox
    text: str


class PageData(TypedDict):
    page_number: int
    text: List[str]
    text_layout: List[str]
    tables: List[Table]


class DocumentStructure(TypedDict):
    pages: List[PageData]


def get_auto_layout(
    pdf_path: str,
    start_page: int,
    end_page: int,
    x_tolerance: int,
    y_tolerance: int,
    y_density: int,
) -> DocumentStructure:
    """
    Extract text and bounding box information from a given PDF.

    Args:
    - pdf_path (str): Path to the PDF file.
    - start_page (int): Page to start extracting from.
    - end_page (int): Page to end extracting at.
    - x_tolerance (int): Tolerance for x-coordinate.
    - y_tolerance (int): Tolerance for y-coordinate.
    - y_density (int): Density for y-coordinate.

    Returns:
    - Dict: Structured data organized by pages.
    """
    pdf = pdfplumber.open(pdf_path)

    output = {"pages": []}

    # Ensure start_page and end_page are within the valid range
    start_page = max(1, min(start_page, len(pdf.pages)))
    end_page = max(1, min(end_page, len(pdf.pages)))

    # Adjust the pages to process based on the start and end pages
    pages_to_process = pdf.pages[
        start_page - 1 : end_page
    ]  # -1 because pages are 0-indexed

    # Enumerate through each page
    for page_number, page in enumerate(pages_to_process, start=1):
        # Extract text from the page
        page_text = page.extract_text(
            x_tolerance=x_tolerance, y_tolerance=y_tolerance, y_density=y_density
        )
        page_text_layout = page.extract_text(
            layout=True,
            x_tolerance=x_tolerance,
            y_tolerance=y_tolerance,
            y_density=y_density,
        )

        # Remove trailing whitespace from each line in page_text_layout
        page_text_layout = "\n".join(
            line.rstrip() for line in page_text_layout.split("\n")
        )

        # Extract tables from the page
        tables = page.extract_tables()
        # For bbox (bounding box), we'll assume you want the bbox of tables
        tables_with_bboxes = [
            {"table": table, "bbox": page.find_tables()[i].bbox}
            for i, table in enumerate(tables)
        ]

        # Append the extracted data to our data structure
        output["pages"].append(
            {
                "pageNumber": page_number,
                "text": page_text,
                "textLayout": page_text_layout,
                "tables": tables_with_bboxes,
            }
        )

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract text and bounding box information from a PDF.",
    )
    parser.add_argument("pdfPath", type=str, help="Path to the PDF file")

    parser.add_argument(
        "--startPage", type=int, default=1, help="Page to start extracting from"
    )
    parser.add_argument("--endPage", type=int, help="Page to end extracting at")
    parser.add_argument(
        "--xTolerance", type=int, default=3, help="Tolerance for x-coordinate"
    )
    parser.add_argument(
        "--yTolerance", type=int, default=3, help="Tolerance for y-coordinate"
    )
    parser.add_argument(
        "--yDensity", type=int, default=10, help="Density for y-coordinate"
    )

    (options, args) = parser.parse_known_args()

    document_structure = get_auto_layout(
        pdf_path=options.pdfPath,
        start_page=options.startPage,
        end_page=(options.endPage if options.endPage else len(pdfplumber.open(options.pdfPath).pages)),
        x_tolerance=options.xTolerance,
        y_tolerance=options.yTolerance,
        y_density=options.yDensity,
    )

    print(json.dumps(document_structure, indent=4))
