"""crack.js: the password crack-time guide on Check a breach. Runs the browser code under Node."""
import json, shutil, subprocess, pytest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
node = shutil.which("node")


def seconds(pw):
    js = "const c=require(%s);console.log(c.crackSeconds(%s))" % (json.dumps(str(ROOT / "crack.js")), json.dumps(pw))
    return float(subprocess.run([node, "-e", js], capture_output=True, text=True, check=True).stdout)


@pytest.mark.skipif(not node, reason="needs Node")
def test_common_and_short_passwords_fall_instantly():
    for pw in ["password", "P@ssw0rd1", "Sydney2024!", "123456", "aaaaaaaa", "qwerty"]:
        assert seconds(pw) < 60, pw


@pytest.mark.skipif(not node, reason="needs Node")
def test_long_random_words_hold_out():
    year = 31557600
    assert seconds("magpie toaster rainbow ladder") > year          # four random words, as ASD advises
    assert seconds("magpie toaster") < 3600                          # two words fall fast: whole words are guessed
    assert seconds("Tq8#vLx2!pZ") > seconds("Tq8#vLx2") > seconds("Tq8#")


@pytest.mark.skipif(not node, reason="needs Node")
def test_empty_is_zero():
    assert seconds("") == 0
