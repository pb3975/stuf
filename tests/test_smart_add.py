"""Unit tests for the SmartAdd provider layer (model selection, image encoding, JSON parsing)."""
from types import SimpleNamespace
from unittest.mock import patch

import pytest

import main


# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------


class TestDataUri:
    def test_preserves_existing_data_uri(self):
        uri = "data:image/png;base64,AAAA"
        assert main._data_uri(uri) == uri

    def test_wraps_raw_base64_as_jpeg_data_uri(self):
        assert main._data_uri("AAAA") == "data:image/jpeg;base64,AAAA"


class TestParseJsonBlock:
    def test_parses_bare_json(self):
        assert main._parse_json_block('{"name": "Drill", "quantity": 2}') == {
            "name": "Drill",
            "quantity": 2,
        }

    def test_strips_json_fence(self):
        text = 'Sure!\n```json\n{"name": "Drill"}\n```\nHope this helps.'
        assert main._parse_json_block(text) == {"name": "Drill"}

    def test_extracts_first_object_from_prose(self):
        text = 'Here you go: {"name": "Drill"} — anything else?'
        assert main._parse_json_block(text) == {"name": "Drill"}

    def test_raises_when_no_json(self):
        with pytest.raises(ValueError):
            main._parse_json_block("I am but prose.")


# ---------------------------------------------------------------------------
# Provider resolution
# ---------------------------------------------------------------------------


class TestSmartAddKeyError:
    def test_returns_none_when_key_present(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "gemini/gemini-2.0-flash-exp")
        monkeypatch.setenv("GEMINI_API_KEY", "present")
        assert main._smart_add_key_error() is None

    def test_flags_missing_key(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "openai/gpt-4o")
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        msg = main._smart_add_key_error()
        assert msg is not None
        assert "OPENAI_API_KEY" in msg
        assert "api key" in msg.lower()

    def test_rejects_unknown_provider(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "wat/nope")
        msg = main._smart_add_key_error()
        assert msg is not None
        assert "wat" in msg
        assert "Supported" in msg

    def test_ollama_needs_no_key(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "ollama/llava")
        monkeypatch.delenv("OLLAMA_API_KEY", raising=False)
        assert main._smart_add_key_error() is None


# ---------------------------------------------------------------------------
# LLM call wiring
# ---------------------------------------------------------------------------


def _mock_completion_response(text: str):
    """Mimic the shape litellm.completion returns (response.choices[0].message.content)."""
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=text))]
    )


class TestCallSmartAddLlm:
    def test_passes_configured_model_and_image_content(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "openai/gpt-4o")

        captured = {}

        def fake_completion(**kwargs):
            captured.update(kwargs)
            return _mock_completion_response('{"ok": true}')

        with patch.object(main.litellm, "completion", side_effect=fake_completion):
            out = main._call_smart_add_llm("describe this", ["AAAA", "BBBB"])

        assert out == '{"ok": true}'
        assert captured["model"] == "openai/gpt-4o"

        messages = captured["messages"]
        assert len(messages) == 1
        assert messages[0]["role"] == "user"

        content = messages[0]["content"]
        # 1 text part + 2 image parts
        assert content[0] == {"type": "text", "text": "describe this"}
        assert content[1]["type"] == "image_url"
        assert content[1]["image_url"]["url"] == "data:image/jpeg;base64,AAAA"
        assert content[2]["image_url"]["url"] == "data:image/jpeg;base64,BBBB"

    def test_preserves_existing_data_uri_in_content(self, monkeypatch):
        monkeypatch.setattr(main, "SMART_ADD_MODEL", "gemini/gemini-2.0-flash-exp")

        captured = {}

        def fake_completion(**kwargs):
            captured.update(kwargs)
            return _mock_completion_response("{}")

        with patch.object(main.litellm, "completion", side_effect=fake_completion):
            main._call_smart_add_llm("hi", ["data:image/png;base64,ZZZ"])

        assert captured["messages"][0]["content"][1]["image_url"]["url"] == (
            "data:image/png;base64,ZZZ"
        )
