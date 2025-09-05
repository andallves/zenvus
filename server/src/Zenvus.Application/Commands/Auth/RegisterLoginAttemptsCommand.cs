using MediatR;

namespace Zenvus.Application.Commands.Auth;

public class RegisterLoginAttemptsCommand : IRequest<Unit>
{
    public string Email { get; set; } = String.Empty;
    public bool Success { get; set; }
}