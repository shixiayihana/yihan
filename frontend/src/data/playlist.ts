export interface Track {
  /** 网易云歌曲 ID，用于拼接外链直链 */
  id: number
  title: string
  artist: string
}

/**
 * 网易云外链音频直链。
 * 歌单 ID 已由站点维护者验证可用，不要主动请求验证（会受地区 / 版权限制）。
 */
export function audioUrl(id: number) {
  return `//music.163.com/song/media/outer/url?id=${id}.mp3`
}

export const playlist: readonly Track[] = [
  { id: 1956990495, title: 'Start Again', artist: 'Connor Price / Chloe Sagum' },
  { id: 1895248679, title: 'SWEATPANTS', artist: 'Jaira Burns' },
  { id: 2526625, title: 'Booty Music', artist: 'Git Fresh' },
  { id: 1865368506, title: 'Not Over You', artist: 'Hoang / Daye' },
  { id: 420401511, title: '和你', artist: '余佳运' },
  { id: 21267236, title: 'Bigcitydreams', artist: 'Never Shout Never' },
  { id: 1426572175, title: 'Blind faith', artist: 'LinG' },
  { id: 1365898499, title: '失眠飞行', artist: '接个吻，开一枪 / 沈以诚 / 薛明媛' },
]
