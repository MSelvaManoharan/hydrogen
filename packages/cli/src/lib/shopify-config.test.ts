import {describe, it, expect} from 'vitest';
import {
  fileExists,
  inTemporaryDirectory,
  mkdir,
  readFile,
  writeFile,
} from '@shopify/cli-kit/node/fs';
import {joinPath, dirname} from '@shopify/cli-kit/node/path';

import {
  getConfig,
  setShop,
  setStorefront,
  unsetStorefront,
  ensureShopifyGitIgnore,
  SHOPIFY_DIR,
  SHOPIFY_DIR_PROJECT,
} from './shopify-config.js';
import type {ShopifyConfig} from './shopify-config.js';

describe('getConfig()', () => {
  describe('when no config exists', () => {
    it('returns an empty object', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const config = await getConfig(tmpDir);

        expect(config).toStrictEqual({});
      });
    });
  });

  describe('when a config exists', () => {
    it('returns the config', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const existingConfig: ShopifyConfig = {
          shop: 'my-shop',
        };
        const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
        await mkdir(dirname(filePath));
        await writeFile(filePath, JSON.stringify(existingConfig));

        const config = await getConfig(tmpDir);

        expect(config).toStrictEqual(existingConfig);
      });
    });
  });
});

describe('setShop()', () => {
  describe('when no config exists', () => {
    it('creates a new config file', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);

        expect(await fileExists(filePath)).toBeFalsy();

        await setShop(tmpDir, 'new-shop');

        expect(await fileExists(filePath)).toBeTruthy();
      });
    });

    it('returns the new config', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const config = await setShop(tmpDir, 'new-shop');

        expect(config).toStrictEqual({
          shop: 'new-shop',
        });
      });
    });
  });

  describe('when a config exists', () => {
    it('updates the config file', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const existingConfig: ShopifyConfig = {
          shop: 'previous-shop',
          storefront: {
            id: 'gid://shopify/HydrogenStorefront/1',
            title: 'Hydrogen',
          },
        };
        const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
        await mkdir(dirname(filePath));
        await writeFile(filePath, JSON.stringify(existingConfig));

        expect(JSON.parse(await readFile(filePath))).toStrictEqual(
          existingConfig,
        );

        await setShop(tmpDir, 'new-shop');

        expect(JSON.parse(await readFile(filePath))).toStrictEqual({
          ...existingConfig,
          shop: 'new-shop',
        });
      });
    });

    it('returns the new config', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const existingConfig: ShopifyConfig = {
          shop: 'previous-shop',
          storefront: {
            id: 'gid://shopify/HydrogenStorefront/1',
            title: 'Hydrogen',
          },
        };
        const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
        await mkdir(dirname(filePath));
        await writeFile(filePath, JSON.stringify(existingConfig));

        const config = await setShop(tmpDir, 'new-shop');

        expect(config).toStrictEqual({
          ...existingConfig,
          shop: 'new-shop',
        });
      });
    });
  });
});

describe('setStorefront()', () => {
  it('updates the config file', async () => {
    await inTemporaryDirectory(async (tmpDir) => {
      const existingConfig: ShopifyConfig = {
        shop: 'previous-shop',
        storefront: {
          id: 'gid://shopify/HydrogenStorefront/1',
          title: 'Hydrogen',
        },
      };
      const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
      await mkdir(dirname(filePath));
      await writeFile(filePath, JSON.stringify(existingConfig));

      expect(JSON.parse(await readFile(filePath))).toStrictEqual(
        existingConfig,
      );

      const newStorefront = {
        id: 'gid://shopify/HydrogenStorefront/2',
        title: 'Remix',
      };

      await setStorefront(tmpDir, newStorefront);

      expect(JSON.parse(await readFile(filePath))).toStrictEqual({
        ...existingConfig,
        storefront: newStorefront,
      });
    });
  });

  it('returns the new config', async () => {
    await inTemporaryDirectory(async (tmpDir) => {
      const existingConfig: ShopifyConfig = {
        shop: 'previous-shop',
        storefront: {
          id: 'gid://shopify/HydrogenStorefront/1',
          title: 'Hydrogen',
        },
      };
      const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
      await mkdir(dirname(filePath));
      await writeFile(filePath, JSON.stringify(existingConfig));

      const newStorefront = {
        id: 'gid://shopify/HydrogenStorefront/2',
        title: 'Remix',
      };

      const config = await setStorefront(tmpDir, newStorefront);

      expect(config).toStrictEqual({
        ...existingConfig,
        storefront: newStorefront,
      });
    });
  });
});

describe('unsetStorefront()', () => {
  it('removes the storefront configuration and returns the config', async () => {
    await inTemporaryDirectory(async (tmpDir) => {
      const existingConfig: ShopifyConfig = {
        shop: 'previous-shop',
        storefront: {
          id: 'gid://shopify/HydrogenStorefront/1',
          title: 'Hydrogen',
        },
      };
      const filePath = joinPath(tmpDir, SHOPIFY_DIR, SHOPIFY_DIR_PROJECT);
      await mkdir(dirname(filePath));
      await writeFile(filePath, JSON.stringify(existingConfig));

      expect(JSON.parse(await readFile(filePath))).toStrictEqual(
        existingConfig,
      );

      const config = await unsetStorefront(tmpDir);

      expect(config).toStrictEqual({
        shop: 'previous-shop',
        storefront: undefined,
      });

      expect(JSON.parse(await readFile(filePath))).toStrictEqual({
        shop: 'previous-shop',
      });
    });
  });
});

describe('ensureShopifyGitIgnore()', () => {
  describe('when a .gitignore file already exists', () => {
    it('updates the .gitignore file and returns true', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const existingFileContents = 'node_modules\r\n';
        const filePath = joinPath(tmpDir, '.gitignore');
        await writeFile(filePath, JSON.stringify(existingFileContents));

        expect(await readFile(filePath)).not.toContain('.shopify');

        const result = await ensureShopifyGitIgnore(tmpDir);

        expect(await readFile(filePath)).toContain('.shopify');
        expect(result).toBeTruthy();
      });
    });

    describe('and the file is already ignoring .shopify', () => {
      it('does not update the file and returns false', async () => {
        await inTemporaryDirectory(async (tmpDir) => {
          const existingFileContents = 'node_modules\n.shopify\r\n';
          const filePath = joinPath(tmpDir, '.gitignore');
          await writeFile(filePath, JSON.stringify(existingFileContents));

          const originalFile = await readFile(filePath);

          const result = await ensureShopifyGitIgnore(tmpDir);

          expect(await readFile(filePath)).toStrictEqual(originalFile);
          expect(result).toBeFalsy();
        });
      });
    });
  });

  describe('when a .gitignore does not exist', () => {
    it('creates the .gitignore file and returns true', async () => {
      await inTemporaryDirectory(async (tmpDir) => {
        const filePath = joinPath(tmpDir, '.gitignore');

        expect(await fileExists(filePath)).toBeFalsy();

        const result = await ensureShopifyGitIgnore(tmpDir);

        expect(await readFile(filePath)).toContain('.shopify');
        expect(result).toBeTruthy();
      });
    });
  });
});
