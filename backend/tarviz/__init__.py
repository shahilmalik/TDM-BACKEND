try:
	# Import auto-admin registration helper so it runs when Django imports this package
	from . import auto_admin  # noqa: F401
except Exception:
	# Avoid breaking startup if admin auto-registration fails
	pass
