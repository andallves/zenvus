# STAGE 1 - build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY . .
RUN dotnet publish src/Zenvus.API/Zenvus.API.csproj -c Release -o /app/publish

# STAGE 2 - runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

RUN ln -snf /usr/share/zoneinfo/America/Fortaleza /etc/localtime \
    && echo America/Fortaleza > /etc/timezone

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Zenvus.API.dll"]
