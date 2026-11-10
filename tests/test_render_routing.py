from pathlib import Path

from scripts.pipeline.render import COMPOSITION, ENTRY, render_command, render_target


def test_legacy_render_target_is_unchanged():
    assert render_target({"id": "ep01", "style": "v3"}) == (ENTRY, COMPOSITION, None)


def test_legacy_command_has_no_new_routing_argument():
    command = render_command({"id": "ep01", "style": "v3"}, Path("ep.props.json"), Path("ep.mp4"), "npx")
    assert command[3:5] == [ENTRY, COMPOSITION]
    assert not any(argument.startswith("--public-dir=") for argument in command)


def test_jaab3d_render_target_is_explicit():
    assert render_target({"id": "nolie01", "style": "jaab3d", "compositionId": "Nolie01"}) == (
        "src/jaab3d/index.tsx", "Nolie01", "public3d"
    )


def test_jaab3d_command_uses_isolated_entry_and_public_dir():
    command = render_command({"id": "nolie01", "style": "jaab3d", "compositionId": "Nolie01"}, Path("nolie.props.json"), Path("nolie.mp4"), "npx")
    assert command[:5] == ["npx", "remotion", "render", "src/jaab3d/index.tsx", "Nolie01"]
    assert "--public-dir=public3d" in command
