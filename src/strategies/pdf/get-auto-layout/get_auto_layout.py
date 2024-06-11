import json
from typing import Dict

from domain.get_document_group import get_document_group
from domain.get_extraction import get_extraction
from domain.save_file_content import save_file_content
from strategy.Utils import Utils

from .fields.PdfAutoLayoutField import PdfAutoLayoutField
from pdf.get_auto_layout import get_auto_layout

def execute(
    extraction_id: int,
    args: Dict[str, str],
    utils: Utils,
) -> None:
    auto_layout_field = PdfAutoLayoutField(utils)

    extraction = get_extraction(extraction_id)
    doc_group = get_document_group(extraction.document_group_id)

    result = {"documents": []}
    for doc in doc_group.documents:
        file_content = save_file_content(doc.id)
        parse_result = get_auto_layout(file_content)
        result["documents"].append(
            {"document_name": doc.name, "pages": parse_result["pages"]}
        )

    field_value = json.dumps(result)

    auto_layout_field.save(field_value)
