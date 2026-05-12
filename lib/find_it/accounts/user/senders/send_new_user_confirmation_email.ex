defmodule FindIt.Accounts.User.Senders.SendNewUserConfirmationEmail do
  @moduledoc """
  Sends an email for a new user to confirm their email address.
  """

  use AshAuthentication.Sender
  use FindItWeb, :verified_routes

  import Swoosh.Email

  alias FindIt.Mailer

  @impl true
  def send(user, token, _) do
    new()
    |> from({"FindIt UniFacens", "noreply@findit.unifacens.edu.br"})
    |> to(to_string(user.email))
    |> subject("Confirme seu e-mail — FindIt")
    |> html_body(body(user: user, token: token))
    |> Mailer.deliver!()
  end

  defp body(params) do
    url = url(~p"/confirm_new_user/#{params[:token]}")
    name = params[:user].name

    """
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">FindIt UniFacens</h2>
      <p>Olá, <strong>#{name}</strong>!</p>
      <p>Clique no botão abaixo para confirmar seu e-mail e ativar sua conta:</p>
      <a href="#{url}"
         style="display: inline-block; margin: 16px 0; padding: 12px 24px;
                background: #4f46e5; color: #fff; border-radius: 8px;
                text-decoration: none; font-weight: bold;">
        Confirmar e-mail
      </a>
      <p style="color: #6b7280; font-size: 13px;">
        Se você não criou uma conta no FindIt, ignore este e-mail.
      </p>
    </div>
    """
  end
end
