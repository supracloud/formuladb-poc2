    

    

//     MESSAGES.push('<speak>Please follow out website for news about the official launch and more details like how to create Tables and Pages, perform data rollups with SUMIF/COUNTIF, define validations and much much more.<break time="2s"/></speak>');
//     DURATIONS.push(0);
//     it('please follow formuladb.io', async (done) => {
//         await e2e_utils.handle_generic_action(DURATIONS[action_index++]);

//         done();
//     });
    
//     it('Should end recording and cleanup', async (done) => {
//         if (browser.params.recordings) {
//             await e2e_utils.wait_for_ffmpeg_stream_to_finish(stream);
//             if (browser.params.audio) {
//                 await e2e_utils.concat_audio(MESSAGES);
//                 await e2e_utils.merge_video_and_audio();
//             } else {
//                 e2e_utils.create_final_video();
//             }
//             await e2e_utils.crop_video();
//             await e2e_utils.create_gif_palette_and_video();
//             e2e_utils.cleanup(test_name);
//         }

//         done();
//     });
    
// });
