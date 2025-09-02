namespace Zenvus.Application.ValueObjects;


public abstract class PagedSearch
{
    public int ItensPerPage { get; set; } = 10;
    public int Page { get; set; } = 1;

    public string OrderBy { get; set; } = "Id";
    public bool OrderAsc { get; set; } = true;
}
