from typing import Any, List, Tuple, TypedDict

import pdfplumber

from settings import global_settings

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


def get_auto_layout(pdf_path: str) -> DocumentStructure:
    """
    Extract text and bounding box information from a given PDF.

    Args:
    - pdf_path (str): Path to the PDF file.

    Returns:
    - Dict: Structured data organized by pages.
    """
    pdf = pdfplumber.open(pdf_path)

    output = {"pages": []}

    start_page = global_settings.get("args_pdf_start_page") or 1
    end_page = global_settings.get("args_pdf_end_page") or len(pdf.pages)
    x_tolerance = global_settings.get("args_pdf_x_tolerance") or 3
    y_tolerance = global_settings.get("args_pdf_y_tolerance") or 3
    y_density = global_settings.get("args_pdf_y_density") or 10

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
                "page_number": page_number,
                "text": page_text,
                "text_layout": page_text_layout,
                "tables": tables_with_bboxes,
            }
        )

    return output
