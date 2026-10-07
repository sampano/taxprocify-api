using JwtAuth.Entities;
using JwtAuth.Model;

namespace JwtAuth.Services
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(UserDto request);

        //Task<string?> LoginAsync(UserDto request);

        Task<TokenResponseDto?> LoginAsync(UserDto request);

        Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
    }
}
