export interface Board {
  id: number;
  image: string;
  title: string;
  count: string;
  date: string;
  users: User[];
}

export interface User {
  id: number;
  rank: number;
  img: string;
  name: string;
  score: string;
}

export const global_games = [
  {
    id: 1,
    name: 'Jump3D',
    shortName: 'jump_3d',
    introduction: 'Jump down helix platforms to reach the end.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/3djump/h5/index.html',
    imageUrl: '/game/jump3d.png',
  },

  {
    id: 2,
    name: 'Fruit Archer',
    shortName: 'fruit_archer_challenge',
    introduction: 'Hit any much fruit with arrows as you can.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/archer/h5/index.html',
    imageUrl: '/game/archer.png',
  },

  {
    id: 3,
    name: 'Shoot Hoops',
    shortName: 'shoot_hoops',
    introduction: 'Shoot the balls into the baskets.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/basketball/h5/index.html',
    imageUrl: '/game/shot.png',
  },

  {
    id: 4,
    name: 'Circle Glide',
    shortName: 'circle_glide',
    introduction: 'Dont let the circle touch the thread!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/circle/circle/index.html',
    imageUrl: '/game/circle.png',
  },

  {
    id: 5,
    name: 'Color Balls',
    shortName: 'color_balls',
    introduction: 'Match the colors of the ball and the wall.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/colorjump/color/index.html',
    imageUrl: '/game/colorjump.png',
  },

  {
    id: 6,
    name: 'Wordscapes',
    shortName: 'wordscapes',
    introduction: 'Connect letters to make words.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/crossword/web-mobile/index.html',
    imageUrl: '/game/weseewe.png',
  },

  {
    id: 7,
    name: 'Spaceships',
    shortName: 'spaceships',
    introduction: 'Shoot the alien spaceships to defend yourself.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/huanxing/ring/index.html',
    imageUrl: '/game/defend.png',
  },

  {
    id: 8,
    name: 'Match It',
    shortName: 'match_it',
    introduction: 'Swap and match 5 shapes together.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/lineslines/lines/index.html',
    imageUrl: '/game/lines.png',
  },

  {
    id: 9,
    name: 'Number Blocks',
    shortName: 'number_blocks',
    introduction: 'Shoot for numbers, break the blocks.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/numberblock/h5/index.html',
    imageUrl: '/game/numberblock.png',
  },

  {
    id: 10,
    name: 'Alien Attack',
    shortName: 'alien_attack',
    introduction: 'Classic galaxy shooter game!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/plane/war/index.html',
    imageUrl: '/game/plane.png',
  },

  {
    id: 11,
    name: 'Save the Monster',
    shortName: 'save_the_monster',
    introduction: 'Keep the little monster from being crushed!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/riseup/keeper/index.html',
    imageUrl: '/game/archer.png',
  },

  {
    id: 12,
    name: 'Rotate Bomb',
    shortName: 'rotate_bomb',
    introduction: 'Aim your bombs at the weak points!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/rotatebomb/h5/index.html',
    imageUrl: '/game/rotate.png',
  },

  {
    id: 13,
    name: 'Block Hive',
    shortName: 'block_hive',
    introduction: 'Drop blocks to create lines of blocks without gaps.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/sixxiaochu/h5/index.html',
    imageUrl: '/game/six！.png',
  },

  {
    id: 14,
    name: 'Make a Bridge',
    shortName: 'make_a_bridge',
    introduction: 'Make a bridge for the little monster.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/stick/%E6%A3%8D%E5%AD%90%E8%8B%B1%E9%9B%84/web/index.html',
    imageUrl: '/game/colorjump.png',
  },

  {
    id: 15,
    name: 'Snake & Block',
    shortName: 'snake_block',
    introduction: 'Guide a snake of balls to break the bricks.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/svb/h5/index.html',
    imageUrl: '/game/svb.png',
  },

  {
    id: 16,
    name: 'Tap Tap Dash',
    shortName: 'tap_tap_dash',
    introduction: 'Tap to jump or switch directions.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/taptap/taptap/index.html',
    imageUrl: '/game/tap.png',
  },

  {
    id: 17,
    name: 'Monster Go',
    shortName: 'monster_go',
    introduction: 'Dont land on the slippery slopes!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/tuzi/h5/index.html',
    imageUrl: '/game/sticker.jpg',
  },

  {
    id: 18,
    name: 'Color Jump',
    shortName: 'color_jump',
    introduction: 'Jump on the same color for more colors!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/weseewe/h5/index.html',
    imageUrl: '/game/weseewe.png',
  },

  {
    id: 19,
    name: 'Space Navigator',
    shortName: 'space_navigator',
    introduction: 'Navigate your ship through the galaxy.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/xingtu/xingtu/index.html',
    imageUrl: '/game/spacetravel.png',
  },
];

export const global_challenges = [
  {
    id: 1,
    name: 'Meta Winner',
    shortName: 'meta_winner',
    introduction: 'Test your Web3 knowledge in a quiz battle!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/ton_pvp_web2/index.html',
    imageUrl: '/game/meta_winner.png',
  },

  {
    id: 2,
    name: 'Amaze',
    shortName: 'amaze',
    introduction: 'Guide your champion through the maze.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/amze/web/index.html',
    imageUrl: '/game/amaze.png',
  },

  {
    id: 3,
    name: 'Chess',
    shortName: 'chess',
    introduction: 'Play and win a classic chess game.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/chess/web/index.html',
    imageUrl: '/game/chess.png',
  },

  {
    id: 4,
    name: 'Class Battle',
    shortName: 'class_battle',
    introduction: 'See who can throw more paper balls!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/class/web/index.html',
    imageUrl: '/game/class_battle.png',
  },

  {
    id: 5,
    name: 'Climb',
    shortName: 'climb',
    introduction: 'Be the first to reach the top of the tree.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/diangan/web/index.html',
    imageUrl: '/game/climb.png',
  },

  {
    id: 6,
    name: 'Animal Chess',
    shortName: 'animal_chess',
    introduction: 'Win beastly battles on the chess board!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/doushouqi/web/index.html',
    imageUrl: '/game/animal chess.png',
  },

  {
    id: 7,
    name: 'Matching Cards',
    shortName: 'matching_cards',
    introduction: 'Match cards & be the memory master.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/fanfanle/web/index.html',
    imageUrl: '/game/matching two.png',
  },

  {
    id: 8,
    name: 'Reversi',
    shortName: 'reversi',
    introduction: 'Flip the coins to conquer your rival!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/fanzhuanqi/web/index.html',
    imageUrl: '/game/reversi.png',
  },

  {
    id: 9,
    name: 'Match Two',
    shortName: 'match_two',
    introduction: 'Connect tiles of same pictures to win.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/lianlian/web/index.html',
    imageUrl: '/game/lianliankan.png',
  },

  {
    id: 10,
    name: 'Coins Battle',
    shortName: 'coins_battle',
    introduction: 'Total up the coins & reach the prices.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/lingqian/web/index.html',
    imageUrl: '/game/coins.png',
  },

  {
    id: 11,
    name: 'Jaws',
    shortName: 'jaws',
    introduction: 'Be the last survivor in the shark pond!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/shks/web/index.html',
    imageUrl: '/game/jaws.png',
  },

  {
    id: 12,
    name: 'Sky Craft',
    shortName: 'sky_craft',
    introduction: 'Strive to be the last ship standing!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/tainkong/web/index.html',
    imageUrl: '/game/tiankong.png',
  },

  {
    id: 13,
    name: 'Match Three',
    shortName: 'match_three',
    introduction: 'Switch and triple match candies.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/tangguo/h5/index.html',
    imageUrl: '/game/match_three.png',
  },

  {
    id: 14,
    name: 'Connect Four',
    shortName: 'connect_four',
    introduction: 'Connect 4 tokens in a row to win.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/xialuoqi/web/index.html',
    imageUrl: '/game/connect four.jpg',
  },

  {
    id: 15,
    name: 'Popstar',
    shortName: 'popstar',
    introduction: 'Pop the block clusters to eliminate them!',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/xmxx/web/index.html',
    imageUrl: '/game/popscore.png',
  },

  {
    id: 16,
    name: 'Brick Crush',
    shortName: 'brick_crush',
    introduction: 'Align the bricks to crush them in time.',
    gameUrl:
      'https://h5game-1256660609.cos.ap-guangzhou.myqcloud.com/vs/xzk/web/index.html',
    imageUrl: '/game/brick.png',
  },
];

const users1: User[] = [
  {
    id: 1,
    rank: 1,
    img: '/avatar/Ellipse1.png',
    name: 'Gloria',
    score: '15,233',
  },
  {
    id: 2,
    rank: 2,
    img: '/avatar/Ellipse2.png',
    name: 'Ross',
    score: '11,000',
  },
  {
    id: 3,
    rank: 3,
    img: '/avatar/Ellipse3.png',
    name: 'Gabrielle',
    score: '10,233',
  },
  {
    id: 4,
    rank: 4,
    img: '/avatar/Ellipse4.png',
    name: 'Andrew',
    score: '9,000',
  },
  {
    id: 5,
    rank: 5,
    img: '/avatar/Ellipse5.png',
    name: 'Kitty',
    score: '8,123',
  },
];
const users2: User[] = [
  {
    id: 1,
    rank: 1,
    img: '/avatar/Ellipse6.png',
    name: 'Andy Liu',
    score: '15,233',
  },
  {
    id: 2,
    rank: 2,
    img: '/avatar/Ellipse7.png',
    name: 'Bruce',
    score: '11,000',
  },
  {
    id: 3,
    rank: 3,
    img: '/avatar/Ellipse8.png',
    name: 'Luck',
    score: '10,233',
  },
  {
    id: 4,
    rank: 4,
    img: '/avatar/Ellipse9.png',
    name: 'Judy',
    score: '9,000',
  },
  {
    id: 5,
    rank: 5,
    img: '/avatar/Ellipse10.png',
    name: 'Kitty',
    score: '8,123',
  },
];

export const boards: Board[] = [
  {
    id: 1,
    image: '/artwork/Card1.png',
    title: 'Color Balls',
    count: '910/1000',
    date: '04/12/23 -31/12/2023',
    users: users1,
  },
  {
    id: 2,
    image: '/artwork/Card2.png',
    title: 'Space Navigator',
    count: '890/1000',
    date: '04/12/23 - 31/12/2023',
    users: users2,
  },
  {
    id: 3,
    image: '/artwork/Card3.png',
    title: 'Chess',
    count: '780/1000',
    date: '04/01/24 - 31/01/2024',
    users: users1,
  },
  {
    id: 4,
    image: '/artwork/Card4.png',
    title: 'Popstar',
    count: '650/1000',
    date: '04/12/24 - 31/12/2023',
    users: users2,
  },
];
