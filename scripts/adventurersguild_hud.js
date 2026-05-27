import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

function openSecondHud(player) {
    const secondForm = new ActionFormData()
        .title("CB_SECOND_MENU") 
        .body("")
        .button("Back")  
        .button("Exit"); 

    secondForm.show(player).then((response) => {
        if (response.canceled) return;
        
        // Handle custom panel buttons here if needed
    });
}

function openMainMenu(player) {
    const form = new ActionFormData()
        .title("CB_GUILD_MENU")
        .body("")
        .button("Yes")    // Index 0: Linked to invisible_yes_btn
        .button("No")     // Index 1: Linked to invisible_no_btn
        .button("Leave"); // Index 2

    form.show(player).then((response) => {
        if (response.canceled) return;

        // Player clicks yes -> Opens the guild menu HUD panel
        if (response.selection === 0) {
            system.run(() => openSecondHud(player));
        }
        
        // Player clicks no -> Form safely closes automatically (Returns)
        if (response.selection === 1) {
            return;
        }
    });
}

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
    const player = event.player;
    const targetEntity = event.target;

    if (targetEntity.typeId !== "cb:advguild_fm_npc") return;

    system.run(() => {
        openMainMenu(player);
    });
});