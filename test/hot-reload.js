import manifest from "./manifest.json";

const injectUrlList = manifest.content_scripts
  .map((item) => item.matches)
  .flat(2);

const filesInDirectory = (dir) =>
  new Promise((resolve) =>
    dir.createReader().readEntries((entries) =>
      Promise.all(
        entries
          .filter((e) => e.name[0] !== ".")
          .map((e) =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise((resolve) => e.file(resolve))
          )
      )
        .then((files) => [].concat(...files))
        .then(resolve)
    )
  );

const timestampForFilesInDirectory = (dir) =>
  filesInDirectory(dir).then((files) =>
    files.map((f) => f.name + f.lastModifiedDate).join()
  );

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then((timestamp) => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), 1000); // retry after 1s
    } else {
      chrome.runtime.reload();
    }
  });
};
chrome.management.getSelf((self) => {
  if (self.installType === "development") {
    chrome.runtime.getPackageDirectoryEntry((dir) => watchChanges(dir));
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(({ url }, index) => {
        if (
          injectUrlList.some((item) => {
            const reg = new RegExp(item.replace(/\*/g, ".+"));
            return reg.test(url);
          })
        ) {
          chrome.tabs.reload(tabs[index].id);
        }
      });
    });
  }
});
