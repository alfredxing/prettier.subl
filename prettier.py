import os
import subprocess

import sublime
import sublime_plugin

LOG_PREFIX = "[PRETTIER]"
PACKAGE_PATH = os.path.dirname(os.path.realpath(__file__))

class Prettier(sublime_plugin.EventListener):
	def on_pre_save(self, view):
		view.run_command("prettier")

class PrettierCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		node = which("node")
		if node is None:
			print(LOG_PREFIX, "Error: can't find node executable")
			return

		entry = os.path.join(PACKAGE_PATH, "dist/entry.js")
		cmd = [node, entry, self.view.file_name()]
		proc = subprocess.run(cmd, capture_output=True, encoding="utf-8")
		print(proc.stdout)

def which(exe):
	def is_exe(path):
		return os.path.isfile(path) and os.access(path, os.X_OK)

	for directory in os.environ["PATH"].split(os.pathsep):
		path = os.path.join(directory, exe)
		if is_exe(path):
			return path

	return None