// Netlify Build Plugin to skip Git LFS files during checkout
// This runs before the build to configure Git to skip LFS files

module.exports = {
  onPreBuild: async ({ utils }) => {
    console.log('Configuring Git to skip LFS files...');
    try {
      // Configure Git to skip LFS smudge (download) during checkout
      await utils.run.command('git config --global filter.lfs.smudge "git-lfs smudge --skip %f"');
      await utils.run.command('git config --global filter.lfs.process "git-lfs filter-process --skip"');
      await utils.run.command('git config --global lfs.fetchexclude "*"');
      console.log('Git LFS skip configured successfully');
    } catch (error) {
      console.log('Note: Git LFS configuration may not be needed or available');
      console.log('Continuing with build...');
    }
  }
};

