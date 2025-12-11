import { PageBody } from '@kit/ui/page';
import { TasksPageContainer } from '@kit/tasks/components';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata = {
  title: 'Tasks',
  description: 'Manage your tasks and stay organized',
};

function TasksPage() {
  return (
    <PageBody>
      <div className="container mx-auto max-w-6xl">
        <TasksPageContainer />
      </div>
    </PageBody>
  );
}

export default withI18n(TasksPage);
