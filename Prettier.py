import os
import subprocess
import sys
import json
import time

import sublime
import sublime_plugin

LOG_PREFIX = "[PRETTIER]"
PACKAGE_PATH = os.path.dirname(os.path.realpath(__file__))
DEBUG = False

class Prettier(sublime_plugin.EventListener):
	def on_pre_save(self, view):
		view.run_command("prettier")

class PrettierCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		start = time.time()
		view = self.view
		region = sublime.Region(0, view.size())
		source = view.substr(region)

		node = which("node")
		if node is None:
			log_error("Error: can't find node executable")
			return

		stdin = json.dumps({
			"filePath": view.file_name(),
			"source": source,
			"cursorOffset": view.sel()[0].a if len(view.sel()) > 0 else 0,
		})
		entry = os.path.join(PACKAGE_PATH, "dist/entry.js")
		cmd = [node, entry]
		proc = subprocess.run(cmd, input=stdin, capture_output=True, encoding="utf-8")

		if (proc.returncode > 0):
			log_error(proc.stderr)
			return

		res = json.loads(proc.stdout)
		log_debug("Got result", res)

		if "skip" in res:
			return

		formatted = res["formatted"]
		cursor_offset = res["cursorOffset"]

		if (formatted == source):
			return

		view.replace(edit, region, formatted)
		view.sel().clear()
		view.sel().add(sublime.Region(cursor_offset))
		log_debug("Formatting timing", time.time() - start)

def which(exe):
	def is_exe(path):
		return os.path.isfile(path) and os.access(path, os.X_OK)

	for directory in os.environ["PATH"].split(os.pathsep):
		path = os.path.join(directory, exe)
		if is_exe(path):
			return path

	return None

def log(*args):
	print(LOG_PREFIX, *args)

def log_error(*args):
	print(LOG_PREFIX, *args, file=sys.stderr)

def log_debug(*args):
	if DEBUG:
		print(LOG_PREFIX, *args)
