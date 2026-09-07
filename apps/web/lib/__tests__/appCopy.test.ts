import {describe, it, expect} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import ts from 'typescript';

describe('App copy', () => {
  it('has no em dashes in authored UI strings', () => {
    const failures: string[] = [];
    function scan(dir: string) {
      for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', '__tests__', '.next'].includes(entry.name)) scan(file);
        } else if (/\.tsx?$/.test(entry.name)) {
          const source = readFileSync(file, 'utf8');
          const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
          function visit(node: ts.Node) {
            if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) && /\u2014|&mdash;/.test(node.getText(tree))) failures.push(file);
            ts.forEachChild(node, visit);
          }
          visit(tree);
        }
      }
    }
    for (const folder of ['../../components', '../../app', '../../lib', '../../../../packages/core/explain']) scan(resolve(__dirname, folder));
    expect(failures).toEqual([]);
  });
  it('removes the requested profile captions and sign-off', () => {
    const profile = readFileSync(resolve(__dirname, '../../components/profile/SocialScrapbook.tsx'), 'utf8');
    for (const copy of ['a whole person.', 'a few things that make you, you.', 'Still becoming. Always more than a profile.']) expect(profile).not.toContain(copy);
    for (const file of ['../../app/home/page.tsx', '../../components/MatchKeepsake.tsx']) expect(readFileSync(resolve(__dirname, file), 'utf8')).not.toContain('a little hello.');
  });
});
