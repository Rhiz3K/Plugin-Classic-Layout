Classic Layout is the default Termix layout. It draws the whole app, so it is always installed.

## What it gives you

The icon rail on the left opens the host list, credentials, Quick Connect and the panels other plugins add. The sidebar next to it can be resized, and any panel that allows it can also open in a right dock. Tabs sit in the tab bar, and a tab can be split into panes.

The Dashboard, Manage and Settings screens open as tabs. The command palette opens with its shortcut and finds hosts, tabs, settings and actions. On a phone the rail becomes a bottom bar.

## Switch to another layout

Open Settings, Appearance and pick a layout. Admins can set the default layout for everyone. You can switch back at any time, and Classic Layout cannot be uninstalled.

If a layout cannot be shown, Termix opens a repair screen. From there you can switch to another layout, reset to the default look or, as an admin, update, turn off or restore the copy that shipped with Termix. Add `?safe-layout=1` to the address to open the repair screen on purpose.

## For plugin authors

Classic Layout offers two components other plugins can place with `PluginComponent` while it is the layout in use:

| Component id               | Shows                                                     |
| -------------------------- | --------------------------------------------------------- |
| `classic-layout.hostTree`  | The host list with search, folders and actions. No props. |
| `classic-layout.dashboard` | The Dashboard. No props.                                  |

It also registers the `dashboard`, `host-manager` and `settings` tab types. Termix only runs the code of the layout in use, so these are not there when another layout is chosen.
