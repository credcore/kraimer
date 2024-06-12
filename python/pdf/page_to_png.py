import json
import base64
import os
from typing import List, Dict
from xmlrpc.client import Boolean
import pdfplumber


def convert_pdf_to_pngs(
    pdf_path: str, start_page: int = 1, end_page: int = None, debug: Boolean = False
) -> Dict[str, List[str]]:
    """
    Convert pages of a PDF to PNG format and save them.

    Args:
    - pdf_path (str): Path to the PDF file.
    - start_page (int): Page to start converting from.
    - end_page (int): Page to end converting at.

    Returns:
    - Dict[str, List[str]]: List of file paths of the saved PNG files.
    """
    pdf = pdfplumber.open(pdf_path)

    if end_page is None:
        end_page = len(pdf.pages)

    start_page = max(1, min(start_page, len(pdf.pages)))
    end_page = max(1, min(end_page, len(pdf.pages)))

    pages_to_process = pdf.pages[start_page - 1 : end_page]
    result = []

    for page_number, page in enumerate(pages_to_process, start=start_page):
        im = page.to_image(resolution=300)
        page_png_path = f"/tmp/page_{page_number}.png"
        im.save(page_png_path, format="PNG")
        result.append(page_png_path)

    return {"pages": result}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Convert PDF pages to PNG.")
    parser.add_argument("pdfPath", type=str, help="Path to the PDF file")
    parser.add_argument(
        "--startPage", type=int, default=1, help="Page to start converting from"
    )
    parser.add_argument("--endPage", type=int, help="Page to end converting at")
    parser.add_argument("--debug", action="store_true")
    args = parser.parse_args()

    result = convert_pdf_to_pngs(args.pdfPath, args.startPage, args.endPage, args.debug)

    print(json.dumps(result, indent=4))
