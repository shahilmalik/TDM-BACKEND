from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Default pagination for list endpoints in this project.

    - Default page size: 20
    - Allow overriding with ?page_size=...
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000
