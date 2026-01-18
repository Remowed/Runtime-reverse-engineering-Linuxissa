import frida
import sys
import time


def on_message(message, data):
    if message['type'] == 'send':
        payload = message.get('payload')
        if payload and payload.get('type') == 'password':
            print(f"\n{'=' * 60}")
            print(f"CAPTURED PASSWORD #{payload.get('count', 0)}: {payload['value']}")
            print(f"{'=' * 60}")
        else:
            print(f"{message.get('payload', '')}")
    elif message['type'] == 'error':
        print(f"[ERROR] {message}")


def main():
    import subprocess
    result = subprocess.run(['pidof', 'target'], capture_output=True, text=True)

    if result.returncode != 0:
        print("[-] Target process not running")
        print("[*] Please run ./target in another terminal first")
        return

    pid = result.stdout.strip()
    print(f"[*] Found target with PID: {pid}")

    with open("hooks/strcmp.js", "r") as f:
        js_code = f.read()

    session = frida.attach(int(pid))
    script = session.create_script(js_code)
    script.on("message", on_message)

    print("[*] Loading hooks...")
    script.load()

    print("[*] Hooks installed! Check the other terminal where target is running.")
    print("[*] Type passwords in the other terminal.")
    print("[*] Press Ctrl+C here to exit\n")

    try:
        sys.stdin.read()
    except KeyboardInterrupt:
        print("\n[*] Exiting...")
    finally:
        session.detach()


if __name__ == "__main__":
    main()