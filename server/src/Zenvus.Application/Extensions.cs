using System.Globalization;
using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SixLabors.Fonts;

namespace Zenvus.Application;

public static class Extensions
{
 public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        ValidatorOptions.Global.LanguageManager.Culture = new CultureInfo("pt-BR");
        
        services
            .AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        ValidatorOptions.Global.LanguageManager.Culture = new CultureInfo("pt-BR");
        
        services
            .AddMediatR(config =>
            {
                config.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
                config.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });
        
        services.AddSingleton<FontCollection>(_ => 
        {
            var collection = new FontCollection();
            collection.AddSystemFonts();
            return collection;
        });
        
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        services.AddBackgroundJobs();
        
        services.AddInfraLayer();

        return services;
    }

    private static void AddBackgroundJobs(this IServiceCollection services)
    {
        services
            .AddQuartz(q =>
            {
                var usuarioCadastradoJobKey = new JobKey("UsuarioCadastradoJob");
                q.AddJob<UsuarioCadastradoJob>(usuarioCadastradoJobKey);

                q.AddTrigger(opt => opt
                    .ForJob(usuarioCadastradoJobKey)
                    .WithIdentity("UsuarioCadastradoJob")
                    .StartNow()
                    .WithSimpleSchedule(sc => sc.WithIntervalInSeconds(1).RepeatForever()));

                
                var gerenciaRotasDeGrupoAcesso = new JobKey("GerenciaRotasGrupoDeAcessoJob");
                q.AddJob<GerenciaRotasGrupoDeAcessoJob>(gerenciaRotasDeGrupoAcesso);
                
                q.AddTrigger(opt => opt
                    .ForJob(gerenciaRotasDeGrupoAcesso)
                    .WithIdentity("GerenciaRotasGrupoDeAcessoJob")
                    .StartNow());
                
                var atrelarSetoresAUsuariosJob = new JobKey("AtrelarUsuariosASetoresJob");
                q.AddJob<AtrelarUsuariosASetoresJob>(atrelarSetoresAUsuariosJob);

                q.AddTrigger(opt => opt
                    .ForJob(atrelarSetoresAUsuariosJob)
                    .WithIdentity("AtrelarUsuariosASetoresJob")
                    .StartNow()
                    .WithSimpleSchedule(sc => sc.WithIntervalInSeconds(1).RepeatForever()));
                
                var atualizarUsuariosJobKey = new JobKey("AtualizarUsuariosJob");
                q.AddJob<AtualizarUsuariosJob>(atualizarUsuariosJobKey);

                q.AddTrigger(opt => opt
                    .ForJob(atualizarUsuariosJobKey)
                    .WithIdentity("AtualizarUsuariosJob")
                    .StartNow()
                    .WithSimpleSchedule(sc => sc.WithIntervalInSeconds(1).RepeatForever()));
                
                var enviarEmailAniversariantesMensal = new JobKey("EnviarEmailAniversariantesMensal");
                q.AddJob<EnviarEmailsAniversariantesMensalJob>(enviarEmailAniversariantesMensal);
                
                q.AddTrigger(opt => opt
                    .ForJob(enviarEmailAniversariantesMensal)
                    .WithIdentity("EnviarEmailAniversariantesMensal")
                    .StartNow()
                    .WithSchedule(CronScheduleBuilder
                        .CronSchedule("0 0 8 1 * ?")
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")))
                    .StartNow());
                
                var enviarEmailAniversariantesDiario = new JobKey("EnviarEmailAniversariantesDiario");
                q.AddJob<EnviarEmailsAniversariantesMensalJob>(enviarEmailAniversariantesDiario);
                
                q.AddTrigger(opt => opt
                    .ForJob(enviarEmailAniversariantesDiario)
                    .WithIdentity("EnviarEmailAniversariantesDiario")
                    .StartNow()
                    .WithSchedule(CronScheduleBuilder
                        .DailyAtHourAndMinute(8, 0) 
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")))
                    .StartNow());
            });
    }
}
