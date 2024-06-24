import argparse
import os
import re
import shutil
import subprocess
import sys
import json
from pathlib import Path

if not os.path.isdir("node_modules"):
    print("Installing dependencies...")
    subprocess.call(["tsc", "install"])

parser = argparse.ArgumentParser(description="Build and package the addon.")
parser.add_argument(
    "--watch",
    "-w",
    choices=["stable", "preview", "server"],
    help="Whether to continually build and where to sync the project while editing it.",
)
parser.add_argument(
    "--target",
    choices=["release", "debug", "server"],
    default="debug",
    help="Whether to build the addon in debug or release mode.",
)
parser.add_argument(
    "--clean",
    "-c",
    action="store_true",
    help='Clean "BP/scripts" folder before building.',
)
parser.add_argument(
    "--package-only",
    "-p",
    action="store_true",
    help="Only package what's already there.",
)
args = parser.parse_args()

build_pack_name = "ZPK-Mod"


def handleError(err):
    if err:
        exit(err)


def regExpSub(regEx, replace, file):
    with open(file, "r") as f:
        content = f.read()
        contentNew = re.sub(regEx, replace, content, flags=re.M)
    with open(file, "w") as f:
        f.write(contentNew)


if not args.package_only:
    # Check for input and output folder
    if not os.path.isdir("src"):
        os.makedirs("src")
    elif not os.path.isdir("BP/scripts"):
        os.makedirs("BP/scripts")

    # Clean script output folder
    if args.clean:
        print("cleaning script output folder...")
        folder = "BP/scripts"
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if file_path.endswith(".txt"):
                    continue
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print("Failed to delete %s. Reason: %s" % (file_path, e))

    # Build manifests
    handleError(
        subprocess.call(
            [sys.executable, "tools/process_manifest.py", f"--target={args.target}"],
            stdout=subprocess.DEVNULL,
        )
    )

    if args.watch:
        print("syncing com.mojang folder...")
        watch_target = "server" if args.watch == "server" else "debug"
        subprocess.call(
            [sys.executable, "tools/sync2com-mojang.py", f"--dest={args.watch}"],
            stdout=subprocess.DEVNULL,
        )

        print("Watch mode: press control-C to stop.")
        tsc = subprocess.Popen("bun tsc -w", shell=True)
        # Remap absolute imports
        remap_imports = subprocess.Popen(
            [sys.executable, "tools/remap_imports.py", "-w"], stdout=subprocess.DEVNULL
        )
        # Sync to com.mojang
        sync_mojang = subprocess.Popen(
            [
                sys.executable,
                "tools/sync2com-mojang.py",
                "-w",
                "--init=False",
                f"--dest={args.watch}",
            ],
            stdout=subprocess.DEVNULL,
        )

        from time import sleep

        try:
            while True:
                sleep(1)
        except KeyboardInterrupt:
            tsc.kill()
            remap_imports.kill()
            sync_mojang.kill()
            exit()
    else:
        print("building scripts...")
        handleError(subprocess.call(["tsc", "-b"], shell=True))

    # Remap absolute imports
    handleError(subprocess.call([sys.executable, "tools/remap_imports.py"]))
    # Build manifests
    handleError(
        subprocess.call(
            [sys.executable, "tools/process_manifest.py", f"--target={args.target}"]
        )
    )

with open("mc_manifest.json") as file:
    manifest = json.load(file)
    ver = manifest["header"]["version"]
version = f"{ver[0]}.{ver[1]}.{ver[2]}"
mcname = f"{build_pack_name}-{version}"
BP = f"{build_pack_name}-{version}-BP"
RP = f"{build_pack_name}-{version}-RP"
if not os.path.isdir("builds"):
    os.makedirs("builds")

# if os.path.exists(f"builds/{BP}"):
#     shutil.rmtree(f"builds/{BP}")
# if os.path.exists(f"builds/{RP}"):
#     shutil.rmtree(f"builds/{RP}")
# try:
#     shutil.copytree("BP", f"builds/{BP}")
# except:
#     pass
# try:
#     shutil.copytree("RP", f"builds/{RP}")
# except:
#     pass

if args.target != "debug":
    from zipfile import ZipFile

    def zipWriteDir(zip, dirname, arcname):
        for folderName, _, filenames in os.walk(dirname):
            for filename in filenames:
                filePath = os.path.join(folderName, filename)
                zip.write(filePath, arcname / Path(filePath).relative_to(dirname))

    if args.target == "release":
        with ZipFile(f"builds/{BP}.zip", "w") as zip:
            zipWriteDir(zip, f"BP", f"{BP}")
        with ZipFile(f"builds/{RP}.zip", "w") as zip:
            zipWriteDir(zip, f"RP", f"{RP}")
        with ZipFile(f"builds/{mcname}.mcaddon", "w") as zip:
            zipWriteDir(zip, f"BP", f"{BP}")
            zipWriteDir(zip, f"RP", f"{RP}")
        with ZipFile(f"{build_pack_name}.mcaddon", "w") as zip:
            zipWriteDir(zip, f"BP", f"{BP}")
            zipWriteDir(zip, f"RP", f"{RP}")
