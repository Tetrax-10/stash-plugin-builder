import main from "$replace";

(async () => {
  while (!(PluginApi && PluginApi?.React)) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  main()
})();
