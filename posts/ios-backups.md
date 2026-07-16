---
title: "Transparent iOS backups"
date: 2020-07-30
---

Backing up an iOS device is nice and simple: there's iCloud, or connecting your device, opening Finder, and clicking _Back Up Now_.
Unfortunately this process is also rather opaque: all we can do in Finder is to create and restore backups, not view their contents.
I'd like to be able to extract individual files and archive them elsewhere.

At the time of writing there are no up-to-date and polished open source apps for simply viewing backup data in an open format, so here we'll explore how iOS backups are structured and figure out how to extract the raw files.

**All this applies to Big Sur + iOS 14.2**. Since we're depending on undocumented internals, it's entirely possible that this changes across versions[^1], in which case all this spelunking would have to be repeated.

# Diving in

To start, create an unencrypted local backup with Finder over USB. This writes to `~/Library/Application Support/MobileSync/Backup`. To access that directory, I had to go to `System Preferences > Security & Privacy > Privacy > Full Disk Access` and whitelist iTerm.

<!-- https://apple.stackexchange.com/a/390593 -->

Each backup is contained in a single directory. Inside, we find something like the git object store: a bunch of files splayed over up to 256 directories using the first two bytes of their hashes.

The only other files in the backup are these:

```
$ ls *.*
Info.plist      Manifest.db     Manifest.db-shm Manifest.plist  Status.plist
```

`Manifest.db` is an SQLite database which tells us how to navigate and extract data from the store.

```
$ sqlite3 Manifest.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE Files (fileID TEXT PRIMARY KEY, domain TEXT, relativePath TEXT, flags INTEGER, file BLOB);
CREATE INDEX FilesDomainIdx ON Files(domain);
CREATE INDEX FilesRelativePathIdx ON Files(relativePath);
CREATE INDEX FilesFlagsIdx ON Files(flags);
CREATE TABLE Properties (key TEXT PRIMARY KEY, value BLOB);
```

Looking at what `Files` contains, only the first three columns are human-readable, and they associate file hashes with names.

```
sqlite> .headers on
sqlite> select fileID, domain, relativePath from Files limit 1;
fileID|domain|relativePath
aa500a604b1acbfc35306db49185824d974b58f4|AppDomainPlugin-com.apple.quicklook.extension.previewUI|Library
```

We can use these to scavenge data owned by different apps.

# Voice Memos

Let's start with Voice Memos -- a great example because it has a simple data model (audio files presumably stored as-is on disk).

After some poking around, we find the audio files under `Media/Recordings`:

```
sqlite> select fileID, domain, relativePath from Files where relativePath like 'Media/Recordings/%.m4a' limit 1;
fileID|domain|relativePath
e41d74a1b3680375ab2055a45a09053f646d1cc6|MediaDomain|Media/Recordings/20190704 231625.m4a
```

We look for that object in the store and voilà:

```
$ file e4/e41d74a1b3680375ab2055a45a09053f646d1cc6
e4/e41d74a1b3680375ab2055a45a09053f646d1cc6: ISO Media, Apple iTunes ALAC/AAC-LC (.M4A) Audio
```

A more in-depth analysis of Voice Memos' data model is available [here](https://iopscience.iop.org/article/10.1088/1742-6596/1345/5/052053/pdf), but given that it changes from version to version, it's probably best to keep our dependence on it to a minimum.

# Books

Books is equally simple, so here's the query to find all PDFs.

```
sqlite> select fileID, domain, relativePath from Files where relativePath like '%.pdf' and relativePath like '%iBooks%';
fileID|domain|relativePath
a6879231503984af93da6b4da2d1486abe251c2d|HomeDomain|Library/Mobile Documents/iCloud~com~apple~iBooks/Documents/lightweight-static-capabilities.pdf
```

One difference was that not every file was present in the backup. Books likely offloads infrequently accessed files to iCloud, judging from this metadata file:

```
sqlite> select fileID, domain, relativePath from Files where relativePath like '%scalable_tr%';
fileID|domain|relativePath
355653fe1dc68c4565366554e4c3365ebd37bf0f|HomeDomain|Library/Mobile Documents/iCloud~com~apple~iBooks/Documents/.scalable_tr.pdf.icloud
```

# WhatsApp

WhatsApp is notable because it only stores data locally, and thus relies on a third-party service (Google Drive or iCloud) to opaquely move data across devices.
It also has a much more complex data model.

Most of WhatsApp's data is in an SQLite database called `ChatStorage.sqlite`.

```
sqlite> select fileID, domain, relativePath from Files where relativePath like '%ChatStorage.sqlite';
fileID|domain|relativePath
7c7fba66680ef796b916b067077cc246adacf01d|AppDomainGroup-group.net.whatsapp.WhatsApp.shared|ChatStorage.sqlite
```

Fortunately, it's structured in a fairly standard relational manner. The main tables are `ZWAMESSAGE` and `ZWACHATSESSION` (representing messages and DMs/groups). Joining other tables gives us contact names and pointers to media, which are stored as paths to other files in the backup.

I've written a [script](https://github.com/dariusf/ios-backup) which codifies all this and reconstructs message history as a directory of HTML files. It improves on [earlier](https://medium.com/@1522933668924/extracting-whatsapp-messages-from-backups-with-code-examples-49186de94ab4) [work](https://github.com/pixel3rr0r/whatsapp_chat_dump) by supporting groups and taking care to copy out all referenced media, so the entire directory can be archived as-is.

# Conclusion

Now we can do dead-simple manual backups, like on Android.

As this depends on the internals of iOS backups as well as of the apps involved, it'll likely bitrot quickly, but hopefully then it'll serve as a starting point for people who want to do something similar in future.

[^1]: Here's an [example](https://commons.erau.edu/cgi/viewcontent.cgi?article=1099&context=jdfsl) of a prior attempt to document this that is now out of date, though it was useful as a starting point.
