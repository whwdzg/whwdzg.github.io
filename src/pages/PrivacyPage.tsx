/** 隐私政策 / Privacy policy for the main site and three subsites. */
import type { ReactNode } from 'react';
import { PageIntro } from '../components/layout/PageIntro';
import { Link } from '../lib/router';
import { LINKS } from '../data/site';
import '../styles/privacy.css';

const EFFECTIVE_DATE = '2026-11-24';
const POLICY_VERSION = '1.0';
const SCOPE = [
  { name: '水鱼 Blog', path: '/', note: '主站与站内工具' },
  { name: 'Asteria Player', path: '/projects/asteria-player/', note: '本地音乐 / 视频播放器' },
  { name: 'Paligraph Canvas', path: '/projects/paligraph-canvas/', note: '本地笔记 / 无限画布' },
  { name: '来福 Simulation Wiki', path: '/projects/life-simulation-wiki/', note: '静态 Wiki 镜像' },
];

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="privacy-section" id={id}>
      <div className="privacy-section__head">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="page page--privacy">
      <PageIntro
        eyebrow="PRIVACY · POLICY"
        title="隐私政策"
        lead="本站与三个子站都以本地优先、无账号、无广告和无追踪为原则。下面说明哪些数据只留在浏览器、哪些请求会到达第三方，以及你可以如何清除数据。"
        meta={[
          { icon: 'shield', label: '本地优先' },
          { icon: 'document', label: `版本 ${POLICY_VERSION}` },
          { icon: 'clock', label: `生效 ${EFFECTIVE_DATE}` },
        ]}
      />

      <div className="container privacy-layout">
        <article className="privacy-doc">
          <div className="privacy-glance">
            <div>
              <p className="eyebrow">AT A GLANCE</p>
              <h2>简短版</h2>
            </div>
            <ul>
              <li>本站不要求注册账号，不设置站点 Cookie，不投放广告，也不做跨站追踪。</li>
              <li>主题、界面偏好、笔记、播放列表与工具输入等数据保存在你的浏览器本地。</li>
              <li>页面由 GitHub Pages 托管；托管平台可能按自身政策记录访问日志和 IP 地址。</li>
              <li>评论、B 站、Modrinth、MC百科等外部链接会离开本站，适用对应平台的政策。</li>
              <li>你可以随时在浏览器中清除本站数据，或使用站内设置里的缓存清理功能。</li>
            </ul>
          </div>

          <div className="privacy-meta">
            <span>生效日期：{EFFECTIVE_DATE}</span>
            <span>政策版本：{POLICY_VERSION}</span>
            <span>适用范围：主站 + 3 个子站</span>
          </div>

          <Section id="scope" number="01" title="适用范围">
            <p>
              本政策适用于 <strong>水鱼 Blog</strong> 以及由同一仓库构建、部署在 GitHub Pages 上的三个子站。
              它们共享技术栈和托管环境，但功能与本地数据范围不同。
            </p>
            <div className="privacy-scope-grid">
              {SCOPE.map((item) => (
                <Link key={item.path} to={item.path} className="privacy-scope-card">
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                  <code>{item.path}</code>
                </Link>
              ))}
            </div>
            <p className="privacy-note">
              子站也可能有独立仓库与独立部署地址；若其页面内另有隐私说明，以该说明为准。
            </p>
          </Section>

          <Section id="principles" number="02" title="共同原则">
            <div className="privacy-principles">
              <div>
                <strong>本地优先</strong>
                <p>能在浏览器内完成的编辑、解析、导出和播放，不发送到服务器。</p>
              </div>
              <div>
                <strong>最少收集</strong>
                <p>没有账号系统、广告 SDK、行为分析或跨站追踪脚本。</p>
              </div>
              <div>
                <strong>明确边界</strong>
                <p>只有你主动打开外部链接或使用第三方登录 / 评论时，数据才会到达第三方。</p>
              </div>
              <div>
                <strong>可清除</strong>
                <p>本地数据可以通过浏览器站点数据或站内清理功能删除。</p>
              </div>
            </div>
          </Section>

          <Section id="main-site" number="03" title="主站：水鱼 Blog">
            <h3>3.1 保存在本地的数据</h3>
            <p>
              主站会把以下内容存入浏览器的 <code>localStorage</code>、<code>sessionStorage</code> 或
              IndexedDB（具体取决于功能），用于在你下次访问时恢复状态：
            </p>
            <ul>
              <li>站点设置：主题、强调色、壁纸、液态玻璃、动效、页眉行为、性能模式。</li>
              <li>界面状态：侧栏、搜索、筛选、排序、视图模式、PWA 安装提示状态。</li>
              <li>站内工具输入与草稿：编码文本、Markdown 笔记、思维导图、AI 痕迹检查输入等。</li>
              <li>站内笔记与缓存：Markdown 编辑器的笔记、GitHub 评论 / 提交的短期缓存。</li>
              <li>Service Worker 缓存：用于离线打开页面和已访问资源。</li>
            </ul>
            <p>
              这些数据不会自动上传到本站服务器。清除浏览器站点数据会删除它们；站内设置面板也提供缓存清理入口。
            </p>

            <h3>3.2 网络请求与第三方</h3>
            <div className="privacy-table">
              <div className="privacy-table__row privacy-table__head">
                <span>场景</span><span>会发生什么</span><span>适用政策</span>
              </div>
              <div className="privacy-table__row">
                <span>页面与静态资源</span>
                <span>由 GitHub Pages 提供；托管方可能记录访问时间、IP、User-Agent 等日志。</span>
                <span><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub Privacy Statement</a></span>
              </div>
              <div className="privacy-table__row">
                <span>GitHub 评论 / 提交记录</span>
                <span>浏览器直接请求 GitHub 公开 API；写入评论会跳转 GitHub，内容公开可见。</span>
                <span>GitHub 隐私声明</span>
              </div>
              <div className="privacy-table__row">
                <span>B 站、Modrinth、MC百科</span>
                <span>页面展示构建期快照；点击外部链接或封面会访问对应平台。</span>
                <span>各自平台政策</span>
              </div>
              <div className="privacy-table__row">
                <span>外部图片 / 媒体</span>
                <span>浏览器会向图片或媒体所在域名发起请求，可能携带 IP、Referer 和浏览器信息。</span>
                <span>资源所在平台政策</span>
              </div>
            </div>
            <p>
              主站不接入广告联盟、统计 SDK、热力图、A/B 测试或跨站像素。站内没有登录态，也不会建立用户画像。
            </p>

            <h3>3.3 评论与留言</h3>
            <p>
              GitHub 评论区的内容存放在公开 GitHub Issue 中；你提交的昵称、头像、正文和时间会公开显示。
              站内只读取公开数据并缓存到本地。B 站私信入口会打开 B 站，消息由 B 站处理，本站无法读取。
            </p>
          </Section>

          <Section id="asteria" number="04" title="子站：Asteria Player">
            <p>
              Asteria Player 是本地音乐 / 视频播放器。你选择的媒体文件由浏览器直接读取，不会上传到本站或第三方服务器。
            </p>
            <h3>4.1 本地数据</h3>
            <ul>
              <li>媒体库、播放列表、播放进度、音量、播放模式与界面偏好。</li>
              <li>导入的歌词、字幕、弹幕文件及其解析结果。</li>
              <li>PWA 离线缓存和用于恢复播放状态的本地记录。</li>
            </ul>
            <p>
              这些数据保存在浏览器本地存储中，不会形成云端账号或跨设备同步。删除站点数据或卸载 PWA 后可能无法恢复。
            </p>
            <h3>4.2 网络访问</h3>
            <p>
              如果你导入在线媒体链接、封面或外部歌词，浏览器会直接访问对应地址；该请求不受本站控制，适用目标网站的政策。
              页面本身仍由 GitHub Pages 托管。
            </p>
          </Section>

          <Section id="paligraph" number="05" title="子站：Paligraph Canvas">
            <p>
              Paligraph Canvas 是本地优先的笔记与无限画布工具。画布、笔迹、Markdown 笔记和导入的附件都只在当前设备处理。
            </p>
            <h3>5.1 本地数据</h3>
            <ul>
              <li>画布、笔迹、笔记正文、图层、页面设置与界面偏好。</li>
              <li>从本地导入的 Markdown / Obsidian 文件及图片附件。</li>
              <li>用于离线打开子站的 PWA / 浏览器缓存。</li>
            </ul>
            <p>
              子站不提供账号、云同步、遥测或远程备份；PDF 与 Markdown 导出在浏览器内完成。
              清除浏览器站点数据会删除本地笔记，请在清理前自行导出备份。
            </p>
            <h3>5.2 网络访问</h3>
            <p>
              页面由 GitHub Pages 托管；站外链接和嵌入资源会把请求发往对应平台。子站不会把画布或导入文件上传到本站服务器。
            </p>
          </Section>

          <Section id="wiki" number="06" title="子站：来福 Simulation Wiki">
            <p>
              来福 Simulation Wiki 是静态内容镜像，提供页面、媒体与全文搜索。本站不提供注册、编辑或上传功能。
            </p>
            <h3>6.1 本地数据</h3>
            <ul>
              <li>界面偏好（如页面提供）与 PWA 离线缓存。</li>
              <li>已访问页面和媒体文件的浏览器缓存。</li>
            </ul>
            <p>
              搜索索引在浏览器本地运行；没有账号数据，也没有用户编辑记录。原始 Wiki 内容的著作权与平台条款归原权利人所有。
            </p>
            <h3>6.2 网络访问</h3>
            <p>
              页面和媒体通常从本站静态文件加载；外部链接、原始 Wiki 链接或第三方资源会离开本站并适用对应平台政策。
              托管方仍可能记录基础访问日志。
            </p>
          </Section>

          <Section id="third-party" number="07" title="第三方服务与外部链接">
            <p>
              本站不以出售、出租或交换个人信息为目的。下面这些第三方服务只在相应场景中接触你的请求：
            </p>
            <ul>
              <li><strong>GitHub Pages / GitHub API</strong>：页面托管、公开 Issue 与提交记录。</li>
              <li><strong>哔哩哔哩</strong>：站外视频、个人主页、私信入口与公开数据。</li>
              <li><strong>Modrinth / MC百科</strong>：项目下载页、公开项目信息和外链。</li>
              <li><strong>原始 Wiki 平台</strong>：镜像内容来源与署名链接。</li>
              <li><strong>其他外部链接</strong>：由你主动点击后访问的任意网站。</li>
            </ul>
            <p>
              第三方服务有自己的隐私政策、Cookie 和日志策略，本站无法控制。建议在提交评论、登录或上传内容前阅读对应平台说明。
            </p>
          </Section>

          <Section id="rights" number="08" title="你的选择与数据删除">
            <ul>
              <li><strong>清除本地数据</strong>：浏览器设置 → 站点数据 → 删除本站数据；或使用站内设置面板的缓存清理。</li>
              <li><strong>拒绝 PWA 缓存</strong>：不安装 PWA，或在浏览器中清除 Service Worker 与缓存。</li>
              <li><strong>阻止第三方请求</strong>：使用浏览器扩展或网络规则屏蔽 GitHub / B 站 / 外链资源；部分功能可能因此不可用。</li>
              <li><strong>删除公开评论</strong>：GitHub Issue 评论需要在 GitHub 上编辑或删除；本站只读取公开内容。</li>
            </ul>
            <p>
              由于本站没有账号系统，通常无法根据身份定位“你的数据”；本地数据完全由你的浏览器控制。
            </p>
          </Section>

          <Section id="children" number="09" title="未成年人">
            <p>
              本站是个人技术站点，不面向 14 岁以下儿童单独使用，也不会主动收集未成年人的身份信息。
              如果未成年人使用外部评论或第三方平台，应由监护人阅读并同意对应平台条款。
            </p>
          </Section>

          <Section id="security" number="10" title="安全与保留期限">
            <p>
              本站通过 HTTPS 提供页面，静态文件不包含服务端数据库。本地数据保留到你主动清除、浏览器回收或卸载 PWA 为止。
              托管方与第三方平台的日志保留期限由它们决定。
            </p>
            <p>
              请注意：任何网络传输和本地存储都无法保证绝对安全；不要在站内工具或评论中提交密码、身份证件、住址等敏感信息。
            </p>
          </Section>

          <Section id="changes" number="11" title="政策更新">
            <p>
              当功能、第三方服务或数据处理方式发生变化时，本政策可能更新。重大变更会更新本页顶部的生效日期与版本号。
              继续使用本站即表示你了解更新后的说明。
            </p>
          </Section>

          <Section id="contact" number="12" title="联系我们">
            <p>
              对隐私政策有疑问，可以通过公开仓库 Issue 或 B 站私信联系。请勿在公开 Issue 中填写敏感个人信息。
            </p>
            <div className="privacy-contact">
              <a href={`${LINKS.repo}/issues`} target="_blank" rel="noopener noreferrer">GitHub Issues</a>
              <a href={LINKS.bilibili} target="_blank" rel="noopener noreferrer">哔哩哔哩</a>
              <Link to="/about/">返回关于本站</Link>
            </div>
          </Section>

          <footer className="privacy-doc__foot">
            <span>水鱼 Blog · 隐私政策 v{POLICY_VERSION}</span>
            <span>最后更新：{EFFECTIVE_DATE}</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
