defmodule FindIt.Secrets do
  use AshAuthentication.Secret

  def secret_for(
        [:authentication, :tokens, :signing_secret],
        FindIt.Accounts.User,
        _opts,
        _context
      ) do
    Application.fetch_env(:find_it, :token_signing_secret)
  end
end
