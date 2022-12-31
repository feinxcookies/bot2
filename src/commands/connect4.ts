import { CommandInteraction, GuildMember, User, Message, MessageReaction, CollectorFilter } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";



@Discord()
export default abstract class Example {
    myCustomText = "hello"
    @Slash("connect4")
    connect4(
      @SlashOption("user", { type: "USER" }) user: GuildMember | User,
      interaction: CommandInteraction
    ) {
        var wEmoji = ':white_circle:';
        var firstEmoji = ':red_circle:';
        var secondEmoji = ':yellow_circle:';
        var first_turn = true;
        var emoji_map = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
        var first_user = interaction.user;
        var second_user = (user instanceof GuildMember ? user.user : user);
        var tiles:string[][] = [[],[],[],[],[],[],[]];
        // tiles [col][row]
        // fill with white
        //console.table(tiles);
        var m;
        var write_message = (won:boolean) => {
            var m = '';
            if (won) {
                m = `> **${!first_turn ? first_user.username :  second_user.username}** has won!! :sparkles: \n`;
            } else {
                m = `> **${first_turn ? firstEmoji + first_user.username : secondEmoji + second_user.username }** turn to play \n`;
            }
            // for (var col = 0; col < 7; col++) {m+= emoji_map[col]};
            // m += '\n';
            for (var row = 6 - 1; row >= 0 ; row--) {
                for (var col = 0; col < 7; col++) {
                    m+= '   ';
                    if (tiles[col][row] == undefined) {
                        m+= wEmoji;
                    } else {
                        m+= tiles[col][row];
                    }
                    m+= '   ';
                }
                m+= '\n';
            }
            //for (var col = 0; col < 7; col++) {m+= emoji_map[col]};
          //  m += '\n';
            return m;
        }
        m =  write_message(false);  
        var board = interaction.reply({content:m, fetchReply:true}).then(board => {
            if (board instanceof Message) {
                emoji_map.forEach(e => board.react(e));
                attachCollector(board);
            }
            //   1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣
            //     board.react('1️⃣')
            //     .then(() => board.react('2️⃣'))
            //     .then(() => board.react('3️⃣'))
            //     .then(() => board.react('4️⃣'))
            //     .then(() => board.react('5️⃣'))
            //     .then(() => board.react('6️⃣'))
            //     .then(() => board.react('7️⃣'))
            //     .then(attachCollector(board,'1️⃣', 0))
            //     .catch(e => console.error(e));
        })
        
        
        function attachCollector(board: Message) {
            const f1:CollectorFilter<[MessageReaction,User]> = (inputReact:MessageReaction, user:User):boolean => (typeof inputReact.emoji.name === "string" && emoji_map.includes(inputReact.emoji.name) && user.bot === false);
            const collector = board.createReactionCollector({filter:f1, idle: 600000 }); // 10 minutes
            collector.on('collect', (r, user) => {
                r.users.remove(user);
                if (!((first_turn && user == first_user) || (!first_turn && user == second_user))) {return;}               
                
                //console.log(r.emoji.name);
                const column = emoji_map.findIndex(e => e == r.emoji.name );
                if (tiles[column].length < 6) {
                    tiles[ column].push((!first_turn ? secondEmoji:firstEmoji));
                    first_turn = !first_turn;
                    let winner:string | undefined = check_board(tiles);
                    if ( winner == secondEmoji ||  winner == firstEmoji) {
                        collector.stop();
                        m = write_message(true);
                        
                        board.edit(m);

                        return;
                    }
                    m = write_message(false);
                    board.edit(m);
                }
            });
            collector.on('end', (collected, reason) => {
                //console.log(`Collected ${collected.size} items`);
                //interaction.reply(reason);
            });
        }
        function check_board(tiles:string[][]) {
            var count = 0;
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j < 6 ; j++) {
                    var val = tiles[i][j];
                    count++;
                    function check_dir(a:number, b:number) {
                        if (val == undefined) {return false};
                        var prev = val;
                        var  curr:string;
                        for (var c = 0 ; c < 4; c++) {
                            if(i + c * a >= 7 || j + c * b >= 6) {
                                return false;
                            }
                            curr = tiles[i + c * a][j + c * b];
                            if (prev != curr) {
                                return false;
                            }
                            prev = curr;
                        }
                        return true;
                    }

                   // console.log(check_dir(1,0),check_dir(0,1), val);
                    if (check_dir(1,0) || check_dir(0,1) || check_dir(1,1) || check_dir(1,-1) ) {
                        return val;
                    }
                    
                }
            }
        }
        
    }
}