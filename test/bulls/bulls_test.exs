defmodule Practice.PracticeTest do
    use ExUnit.Case
    import Bulls.Game

    test "generate random numbers" do
        assert length(random_digit_sequence([])) == 4
    end
end