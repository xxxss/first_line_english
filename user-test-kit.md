# 第一句英语 · 3-5 人真实用户测试包

> 目的：跳出 n=1，验证两件只有别人能告诉你的事——
> **① 别人用它也学得会、记得住吗？ ② 他们会不会主动回来（留存）？**
> 这两件事，原生 app、更多功能都替你回答不了，只有真实用户能。

---

## 一、招谁（选对人比人多重要）

找 **3-5 个**，尽量贴近你的目标画像：
- **成年人，学过很多年英语，但一开口就卡壳**（就是你自己那种痛点）
- 愿意**每天花 ~10 分钟、连续用一周**（没有这个意愿，测不出留存）
- 手机是 **iPh+ Safari / 安卓 + Chrome**（PWA 装主屏要用）

⚠️ 避开：英语已经很流利的人（不是目标用户）、纯捧场不会认真用的人（数据没用）。
⚠️ **别过度指导他们**——你越少干预，越能看出产品自己站不站得住。

---

## 二、发给他们的话（直接复制，填上你的网址）

```
帮我测一个我在做的英语口语练习 app（网页版，装到手机主屏就像 app）。

【怎么装】
1. 手机浏览器打开：<你的 Netlify 网址>
   （iPhone 用 Safari，安卓用 Chrome）
2. 练习时会用麦克风测你的反应速度 → 弹出权限时点「允许」（纯本地，不上传）
3. iPhone：分享 →「添加到主屏幕」；安卓：菜单 →「安装应用」
4. 练习时把手机静音关掉、音量开一点（要听英文朗读）

【怎么用】
- 每天打开练一次，大概 10 分钟，请连续用一周
- 每个场景：先自己憋着说 → 再跟读标准句 → 再限时冲刺
- 关键：先别看答案，逼自己开口，说不出来再看提示

【小建议】在手机上设一个每天固定时间的提醒/闹钟（比如晚饭后），帮自己养成习惯——
这版还没有内置提醒，先靠这个顶一下。

【我想知道】
- 你会不会想每天回来用（这个最重要）
- 用了一周，遇到那些场景是不是更容易脱口而出
- 哪里让你困惑、烦躁、或想放弃

一周后我发你几个小问题，两分钟就能答。谢谢！🙏
```

---

## 三、你要盯的指标（这才是验证）

按重要性排：

1. **留存（头号）**：他们**第 2、3、5、7 天还回来了吗？**——不用你催的那种。
   语言 app 死在这一条上。哪怕方法再好，不回来 = 0。
   - 记录：每个人实际用了几天 / 7 天。
2. **主观学习感**：一周后，遇到练过的场景，"脱口而出"的感觉有没有变强？
3. **卡点/流失点**：他们在哪一步困惑、烦躁、想退出？（这些是要修的）
4. **每日负载**：每天的量是太多、太少、还是刚好？（Daily goal 调得对不对）

> ⚠️ 数据现状：进度存在各自手机的 localStorage，**你看不到**（没后端）。
> 所以这轮**靠他们自报**。想要能远程看数据，是后端阶段的事，现在不做。

---

## 四、一周后的反馈问卷（发这几个就够，别多）

1. 这一周你实际用了 **几天**？（1-7）
2. 有没有哪天是"本来不想打开、但还是打开了"？是什么让你打开的？
3. 现在遇到练过的场景（比如点咖啡、问路），比一周前**更容易开口**了吗？（明显 / 有一点 / 没感觉）
4. 最让你**困惑或烦躁**的一个地方是什么？
5. 如果这个 app 继续做下去，你**会想接着用**吗？为什么？
6. （可选）有没有在**真实生活里**，练过的某句自己蹦出来过？

---

## 五点五、English versions（发给非中文测试者，直接复制）

**Invite message:**

```
Help me test an English-speaking practice app I'm building (a web app that
installs to your phone home screen like a real app).

HOW TO INSTALL
1. On your phone, open: <your link>
   (iPhone: use Safari. Android: use Chrome.)
2. It uses your mic to measure how fast you start speaking → tap "Allow"
   when asked (it stays on your device, nothing is uploaded).
3. iPhone: Share → "Add to Home Screen". Android: menu → "Install app".
4. Turn OFF silent mode and turn the volume up a bit (you'll hear English).

HOW TO USE
- Open it once a day, about 10 minutes, for a week.
- Each scene: try to say it yourself first → shadow the model line → race the clock.
- Key: don't peek at the answer first — force yourself to speak, then check.

TIP: set a daily reminder/alarm on your phone (e.g. after dinner) to build the habit.

WHAT I WANT TO KNOW
- Whether you feel like coming back each day (most important)
- After a week, whether those situations come out more easily
- Anything confusing, annoying, or that made you want to quit

I'll send a few quick questions after a week — 2 minutes. Thank you! 🙏
```

**Feedback questions (after ~1 week):**

```
1. How many days out of the week did you actually use it? (1-7)
2. Was there a day you didn't feel like opening it but did anyway? What made you?
3. Do the situations you practised (ordering coffee, asking directions...) come
   out more easily than a week ago? (clearly / a little / not really)
4. What one thing was most confusing or annoying?
5. If this app kept being developed, would you want to keep using it? Why?
6. (Optional) Did a line you practised ever pop out in real life?
```

---

## 五、什么结果算"过关"、可以进下一步

- ✅ **过关信号**：3-5 人里有**过半连续用了 ≥4 天**，且多数报告"更容易开口了"。
  → 说明产品对别人也成立、也能留住人 → **这才是上原生 / 做留存功能 / 做后端的入场券**。
- 🟡 **部分信号**：他们觉得有用，但**用两天就不打开了**。
  → 学习有效但留存不行 → 下一步重点是留存机制（提醒/连胜），不是原生。
- ❌ **红灯**：多数人觉得没用、或完全带不进去。
  → 别急着往下走，回到机制本身找问题（可能是场景质量、难度、或代入感）。

> 记住：这轮不是要"好评"，是要**真相**。用两天就弃坑，是最有价值的发现之一。
