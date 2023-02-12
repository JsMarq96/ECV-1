import { World } from './world.mjs'

function main() {
    var canvas = document.getElementById("main_canvas");

    World.init(canvas);
    World.create_room("room_1", "imgs/mezeus-silent-hill.jpg", 0.86);
    World.current_user = World.add_user_to_room("room_1",
                                                "imgs/tileset.png",
                                                4.0,
                                                43, 43,
                                                8, 1,
                                                0,
                                                [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2]);
    World.current_room = "room_1";
    World.render_frame();

    World.objects[World.current_room][World.current_user].move_towards(-220);
}

export { main };
