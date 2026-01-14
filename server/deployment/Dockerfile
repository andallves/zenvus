FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

ENV TZ=America/Fortaleza
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


WORKDIR /app
EXPOSE 8080

COPY ./publish /app.

ENTRYPOINT ["dotnet", "Zenvus.API.dll"]
