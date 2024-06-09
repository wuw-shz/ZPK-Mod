import subprocess
import sys

tsc = subprocess.Popen("tsc -w", shell=True)
remap_imports = subprocess.Popen(
    [sys.executable, "tools/remap_imports.py", "-w"], stdout=subprocess.DEVNULL
)

from time import sleep

try:
    while True:
        sleep(1)
except KeyboardInterrupt:
    tsc.kill()
    remap_imports.kill()
    exit()
