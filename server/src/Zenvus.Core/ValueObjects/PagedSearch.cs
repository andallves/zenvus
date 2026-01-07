namespace Zenvus.Core.ValueObjects;


public abstract class PagedSearch
{
    public int ItemsPerPage { get; set; } = 10;
    public int Page { get; set; } = 1;

    public string OrderBy { get; set; } = "Id";
    protected bool OrderAsc { get; set; } = true;
}
