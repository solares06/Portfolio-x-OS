const fs = require('fs');

let content = fs.readFileSync('src/app/os/page.tsx', 'utf-8');

const todoStart = content.indexOf('{/* To Do (Tasks) */}');
const todoEnd = content.indexOf('</section>', todoStart) + '</section>'.length;
const todoSection = content.slice(todoStart, todoEnd);

const timelineContainerStart = content.indexOf('{/* Right Column: Timeline */}');
const timelineContainerEnd = content.indexOf('</div>', content.indexOf('</section>', timelineContainerStart));

const timelineHeader = '{/* Right Column: Timeline */}\n          <div className="space-y-6">\n            ';
const timelineSectionStart = content.indexOf('<section', timelineContainerStart);
const timelineSectionEnd = content.indexOf('</section>', timelineSectionStart) + '</section>'.length;
const timelineSection = content.slice(timelineSectionStart, timelineSectionEnd);

// What we want:
// Left column (col-span-2) ends with Calendar. We want to append Timeline there.
// Right column starts with To Do.

// 1. Remove To Do from its current place
content = content.slice(0, todoStart) + content.slice(todoEnd);

// 2. The left column ends at the `</div>` before `{/* Right Column: Timeline */}`.
// Let's find that `</div>`
const newTimelineContainerStart = content.indexOf('{/* Right Column: Timeline */}');
const leftColumnEndDiv = content.lastIndexOf('</div>', newTimelineContainerStart);

// We insert timelineSection before leftColumnEndDiv
content = content.slice(0, leftColumnEndDiv) + 
          '{/* Timeline (Moved to left column) */}\n            ' + timelineSection + '\n          ' +
          content.slice(leftColumnEndDiv);

// 3. Now replace the Right Column content with To Do
const finalRightColumnStart = content.indexOf('{/* Right Column: Timeline */}');
const finalRightColumnEnd = content.indexOf('</div>', content.indexOf('</section>', finalRightColumnStart)) + '</div>'.length;

const newRightColumn = '{/* Right Column: To Do (Tasks) */}\n          <div className="space-y-6">\n            ' + todoSection + '\n          </div>';

content = content.slice(0, finalRightColumnStart) + newRightColumn + content.slice(finalRightColumnEnd);

fs.writeFileSync('src/app/os/page.tsx', content);
