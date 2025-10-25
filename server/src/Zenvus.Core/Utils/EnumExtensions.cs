using System.ComponentModel;

namespace Zenvus.Core.Utils;

public static class EnumExtensions
{
    public static string GetDescriptionString(this Enum val)
    {
        var attributes = (DescriptionAttribute[])val
            .GetType()
            .GetField(val.ToString())
            ?.GetCustomAttributes(typeof(DescriptionAttribute), false)!;
        return attributes.Length > 0 ? attributes[0].Description : string.Empty;
    }
}