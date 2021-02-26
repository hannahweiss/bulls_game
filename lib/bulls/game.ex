# Structure of module taken from
# https://github.com/NatTuck/scratch-2021-01/blob/master/4550/0209/hangman/lib/hangman/game.ex
defmodule Bulls.Game do

  def new(game_name) do
    %{
      secret: random_digit_sequence([]),
      last_winners: [],
      leaderboard: %{},
      # if playing is false, game is in setup mode
      playing: false,
      # map of username to map containing user info (ready, role, guesses)
      users: %{},
      game_name: game_name
    }
  end

  def add_new_user(state, user_name) do
    if state.playing and Map.has_key?(state.users, user_name) do
        state
    else
        user_info =
        %{
            ready: false,
            role: "observer",
            guesses: [],
            current_guess: "",
            won: false
        }
        new_users = Map.put(state.users, user_name, user_info)
        # Map.put(map, :d, 4)
        # users[user_name] = user_info

        %{state | users: new_users}
    end
    


  end

  def set_player_ready(state, user_name, ready) do
    users = state.users
    user = users[user_name]
    user = %{user | ready: ready}
    new_users = Map.put(users, user_name, user)

    %{state | users: new_users}
  end

  def set_player_playing(state, user_name, playing) do
    users = state.users
    user = users[user_name]

    user = if playing do
      %{user | role: "player"}
    else
      %{user | role: "observer", ready: false}
    end

    new_users = Map.put(users, user_name, user)
    %{state | users: new_users}
  end

  def game_ready?(state) do
    all_players = Enum.filter(Map.values(state.users), fn (user) -> user.role == "player" end)
    not_ready_players = Enum.filter(all_players, fn (user) -> user.ready == false end)

    ready = length(not_ready_players) == 0 and length(all_players) > 0

    %{state | playing: ready}

  end

  def random_digit_sequence(chosen_digits) do
    if length(chosen_digits) == 4 do
      chosen_digits
    else
      i = :rand.uniform(10) - 1

      if Enum.member?(chosen_digits, i) do
        random_digit_sequence(chosen_digits)
      else
        random_digit_sequence(chosen_digits ++ [i])
      end

    end
  end

  def guess(state, user_name, guess_string) do
    IO.inspect(state.secret)
    users = state.users
    user = users[user_name]

    user = %{user | current_guess: guess_string}
    new_users = Map.put(users, user_name, user)
    %{state | users: new_users}

  end

  def update_guesses(state) do
    users = state.users

    users = Map.new(
      Enum.map(
        users,
        fn {user_name, user_info} ->
          {
            user_name,
            %{
              user_info |
              guesses: [
                Map.put(
                  get_bulls_and_cows(state, user_info.current_guess),
                  :guess_string,
                  user_info.current_guess
                ) | user_info.guesses
              ],
              current_guess: ""
            }
          }
        end
      )
    )

    %{state | users: users}
  end

  def update_game_state(state) do
    users = Map.new(Enum.map(state.users, fn{user_name, user} -> {user_name, update_winner(state.secret, user, user.guesses)} end))
    winners = Enum.map(Enum.filter(users, fn{user_name, user} -> user.won end), fn{user_name, user} -> user_name end)
    game_over = length(winners) > 0
    st = %{state | users: users, playing: !game_over}
    if game_over do
      clear_game_state(st, winners)
    else
      st
    end
  end

  def clear_game_state(state, winners) do
    users = Map.new(Enum.map(state.users, fn {user_name, user} -> {user_name, %{user | guesses: [], role: "observer", ready: false, won: false}} end))
    %{state | users: users, last_winners: winners, secret: random_digit_sequence([]), leaderboard: update_leaderboard(winners, state.leaderboard)}
  end

  def update_leaderboard([], leaderboard) do
    leaderboard
  end

  def update_leaderboard([winner | tail], leaderboard) do
    update_leaderboard(tail, Map.put(leaderboard, winner, (leaderboard[winner] || 0) + 1))
  end

  def update_winner(secret, user, [last_guess | tail]) do
    answer = Enum.join(secret, "")
    %{user | won: answer == last_guess.guess_string}
  end

  def update_winner(secret, user, []) do
    user
  end

  def get_winner_names(state) do
    Enum.map(Enum.filter(state.users, fn{_u, user} -> user.won end), fn{name, _i} -> name end)
  end

  def winning_guess?(secret, guess_string) do
    if length(secret) == 0 do
      true
    else
      {_num, _} = Integer.parse(hd(guess_string))

      if _num == hd(secret) do
        winning_guess?(tl(secret), tl(guess_string))
      else
        false
      end
    end

  end

  def validate_guess(state, guess_string) do
    IO.puts(state.guesses)
    if String.length(guess_string) != 4 or already_guessed?(state, guess_string)do
      false
    else
      recursive_validate(String.graphemes(guess_string), [])
    end
  end

  def already_guessed?(state, guess_string) do
    guesses = state.guesses
    guesses = Enum.map(guesses, fn x -> String.slice(x, 0, 4) end)

    Enum.member?(guesses, guess_string)

  end

  def recursive_validate(guess, used_digits) do
    if length(guess) == 0 do
      true
    else
      case Integer.parse(hd(guess)) do
        {_num, ""} ->
          if Enum.member?(used_digits, _num) do
            false
          else
            recursive_validate(tl(guess), [_num] ++ used_digits)
          end
        _ -> false
      end
    end
  end

  def get_bulls_and_cows(state, guess_string) do
    if guess_string == "" do
      %{bulls: 0, cows: 0}
    else
      recursive_bulls_and_cows(
        state.secret,
        String.graphemes(guess_string),
        0,
        0,
        0
      )
    end
  end

  def recursive_bulls_and_cows(secret, guess_string, i, bulls, cows) do
    if i > 3 do
      %{bulls: bulls, cows: cows}
    else
      {guess_num, _} = Integer.parse(Enum.at(guess_string, i))
      if guess_num == Enum.at(secret, i) do
        recursive_bulls_and_cows(secret, guess_string, i + 1, bulls + 1, cows)
      else
        if Enum.member?(secret, guess_num) do
          recursive_bulls_and_cows(secret, guess_string, i + 1, bulls, cows + 1)
        else
          recursive_bulls_and_cows(secret, guess_string, i + 1, bulls, cows)
        end
      end
    end
  end

  def view(state) do
    %{state | secret: ""}
  end

end
