# Structure of module taken from 
# https://github.com/NatTuck/scratch-2021-01/blob/master/4550/0209/hangman/lib/hangman/game.ex
defmodule Bulls.Game do

    def new do
        %{
          secret: random_digit_sequence([]),
          warning_str: "",
          lives: 8,
          game_over: false,
          # if playing is false, game is in setup mode
          playing: false,
          # map of username to map containing user info (ready, role, guesses)
          users: {},
        }
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

    def guess(state, guess_string) do
        if validate_guess(state, guess_string) do
            if winning_guess?(state.secret, String.graphemes(guess_string)) do
                %{ state | lives: 0, won: true}
            else
                %{ state | guesses: state.guesses ++ [guess_string <> ": " <> get_bulls_and_cows(state, guess_string)], 
                warning_str: "", 
                lives: state.lives - 1 }
            end
        else
            %{ state | warning_str: "Invalid Guess"}
        end
        
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
                _          -> false
            end
        end
    end

    def get_bulls_and_cows(state, guess_string) do
        recursive_bulls_and_cows(
            state.secret, 
            String.graphemes(guess_string), 
            0, 0, 0)
    end

    def recursive_bulls_and_cows(secret, guess_string, i, bulls, cows) do
        if i > 3 do
            to_string( bulls) <> " bulls, " <> to_string( cows) <> " cows"
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
        %{ state | secret: ""}
    end

end