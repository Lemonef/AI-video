# Growth playbook: keeping the audience hooked across episodes

Researched 2026-10-27. Most sources are marketing blogs rather than TikTok data, so treat this as practice to test, not law. Measure everything in TikTok Studio.

## The series loop

1. **Every Part 2+ opens with a one-line recap and the part number on screen.** Most part-2 viewers never saw part 1 (one creator: part 1 had 80K views, part 2 had 21K). Add one callback to earlier material.
2. **Close one open loop per episode and open a real new one.** Never promise what the next episode can't pay off.
3. **The A/B question is specific and answerable** ("วิ่งต่อ หรือ หันไฟฉาย?"), not "what do you think?". It's the episode's call to action, so it appears early and stays up.
4. **Post the next part as a reply-to-comment video** on the comment that chose the winning path. It thanks that viewer and threads the series together.
5. **Put a fixed time in the caption** ("ตอนต่อไป พรุ่งนี้ 20:00"), the way Keep Pip Alive does ("New part every day at 7pm"). The habit is the product.

## Comments

6. **Pin your own comment** with the choice plus a tally ("📌 A = วิ่งต่อ · B = หันไฟฉาย — ตอนนี้ A นำ!"), or pin the best viewer comment. One pin per video.
7. **Reply fast in the first 30–60 minutes.** Commonly claimed to help distribution; not confirmed by TikTok, but it's free.

## Profile and series

8. **Playlists per story arc** (e.g. "กฎเข้าป่า"), in order. TikTok prompts the next video when one finishes. Availability varies by account; check the profile's Videos tab. The playlist cover = the first video's cover, so make it strong.
9. **Pin three videos on the profile:** EP1 of the current arc, the best performer, and a "who is จ๊าบ" intro.
10. **The character is the brand.** Same face, name, voice and look on every post (see the series hub: build around the character, not the trend).

## Schedule

11. **Thai evening, about 18:00–22:00 ICT,** tested over 2–4 weeks against your own analytics. Global "best times" disagree with each other.
12. **A cadence you can sustain** (3–4 per week from the series plan) beats bursts.

## Measure (weekly)

- **Hook rate:** the share of viewers still watching after the first seconds.
- **Completion rate:** part 2 against standalone posts.
- **Comment rate per view:** the A/B answers are the engine.
- **Followers gained per episode.**

## Automated by the pipeline

`make.py` writes `out/final/<ep>.post.txt` (caption, pinned comment, hashtags) and `out/final/<ep>-cover.png` (the hook frame, for the cover and the playlist thumbnail) from the episode's `post` block, so posting manually takes about a minute.

## Sources

[DEV, planning part 2 (recap, callback, cliffhanger)](https://dev.to/agentworkshop/how-to-plan-the-next-part-of-a-tiktok-series-so-part-2-viewers-arent-lost-2026-recap-callback-e1a) · [SocialKit, series strategy](https://socialk.it/en/blog/tiktok-series-content-strategy) · [MegaDigital, TikTok Series](https://megadigital.ai/en/blog/tiktok-series-monetization/) · [MediaPost, episodic branded content](https://www.mediapost.com/publications/article/416217/tiktok-incentivizes-brands-to-create-promotional-e.html) · [The Keyword, Reels series](https://www.thekeyword.co/news/meta-reels-series-feature) · [SocialKit, pinned comments](https://socialk.it/en/blog/pinned-comments-strategy) · [Sprout Social, TikTok comments](https://sproutsocial.com/insights/?p=160990) · [Socialync, comments 2026](https://www.socialync.io/blog/increase-tiktok-comments-engagement-2026) · [Hootsuite, playlists](https://blog.hootsuite.com/how-to-make-a-playlist-on-tiktok/) · [Social Media Today, playlists launch](https://www.socialmediatoday.com/news/tiktok-launches-new-playlists-feature-to-group-clips-into-themed-collecti/597460) · [Time to Post, Thailand](https://timetopost.co/best-time-to-post/tiktok/thailand/) · [Hopper, best times 2026](https://hopperhq.com/blog/best-time-to-post-on-tiktok/)
